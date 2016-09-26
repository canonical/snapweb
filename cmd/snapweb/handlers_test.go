/*
 * Copyright (C) 2016 Canonical Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "gopkg.in/check.v1"

	"github.com/snapcore/snapweb/snappy"
)

func Test(t *testing.T) { TestingT(t) }

type HandlersSuite struct {
	c *snappy.FakeSnapdClient
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) SetUpTest(c *C) {
	s.c = &snappy.FakeSnapdClient{}

	s.c.Version.Version = "1000"
	s.c.Version.Series = "16"
	//	s.c.Interfaces = client.Interfaces{Plugs: {Snap: "snap"}, Slots: {}}

	s.c.Err = nil
}

func (s *HandlersSuite) TearDownTest(c *C) {
}

func (s *HandlersSuite) TestGetSnappyVersionError(c *C) {
	s.c.Err = errors.New("fail")
	c.Assert(getSnappyVersion(s.c), Equals, "snapd")
}

func (s *HandlersSuite) TestGetSnappyVersion(c *C) {
	c.Assert(getSnappyVersion(s.c), Equals, "snapd 1000 (series 16)")
}

func (s *HandlersSuite) TestLoggingHandler(c *C) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	logged := loggingHandler(handler)

	var output bytes.Buffer
	log.SetOutput(&output)
	defer func() {
		log.SetOutput(os.Stdout)
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/foo", nil)
	c.Assert(err, IsNil)

	logged.ServeHTTP(rec, req)

	c.Assert(output.String(), Matches, ".*GET /foo\n")
}

func (s *HandlersSuite) TestGetBranding(c *C) {
	c.Assert(getBranding(), DeepEquals, branding{Name: "Ubuntu", Subname: ""})
}

func (s *HandlersSuite) TestServesIcons(c *C) {
	tmp := c.MkDir()
	icons := filepath.Join(tmp, "icons")
	iconPath := filepath.Join(icons, "foo.png")

	os.Setenv("SNAP_DATA", tmp)
	c.Assert(os.Mkdir(icons, os.ModePerm), IsNil)
	c.Assert(ioutil.WriteFile(iconPath, []byte{}, os.ModePerm), IsNil)

	initURLHandlers(s.c, nil, log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	// icon exists
	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/icons/foo.png", nil)
	c.Assert(err, IsNil)

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)

	// icon doesn't exist
	rec = httptest.NewRecorder()
	req, err = http.NewRequest("GET", "/icons/bar.png", nil)
	c.Assert(err, IsNil)

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusNotFound)
}

func (s *HandlersSuite) TestMakeMainPageHandler(c *C) {
	cwd, err := os.Getwd()
	c.Assert(err, IsNil)
	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(s.c, nil, log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/", nil)
	c.Assert(err, IsNil)

	http.DefaultServeMux.ServeHTTP(rec, req)
	body := rec.Body.String()

	c.Check(strings.Contains(body, "'Ubuntu'"), Equals, true)
	c.Check(strings.Contains(body, "'snapd 1000 (series 16)'"), Equals, true)
}

func (s *HandlersSuite) TestRenderLayoutNoTemplateDir(c *C) {
	os.Setenv("SNAP", c.MkDir())

	rec := httptest.NewRecorder()
	renderLayout("foo.html", &templateData{}, rec)
	c.Assert(rec.Body.String(), Matches, ".*no such file or directory\n")
	c.Assert(rec.Code, Equals, http.StatusInternalServerError)
}

func (s *HandlersSuite) TestRenderLayoutParseError(c *C) {
	tmp := c.MkDir()
	templateDir := filepath.Join(tmp, "www", "templates")
	layoutPath := filepath.Join(templateDir, "base.html")
	templatePath := filepath.Join(templateDir, "foo.html")

	os.Setenv("SNAP", tmp)
	c.Assert(os.MkdirAll(templateDir, os.ModePerm), IsNil)

	c.Assert(ioutil.WriteFile(layoutPath, []byte("{{{"), os.ModePerm), IsNil)
	c.Assert(ioutil.WriteFile(templatePath, []byte(""), os.ModePerm), IsNil)

	rec := httptest.NewRecorder()
	renderLayout("foo.html", &templateData{}, rec)
	c.Assert(strings.HasPrefix(rec.Body.String(), "template:"), Equals, true)
	c.Assert(rec.Code, Equals, http.StatusInternalServerError)
}

func (s *HandlersSuite) TestRenderLayout(c *C) {
	tmp := c.MkDir()
	templateDir := filepath.Join(tmp, "www", "templates")
	layoutPath := filepath.Join(templateDir, "base.html")
	templatePath := filepath.Join(templateDir, "foo.html")

	os.Setenv("SNAP", tmp)
	c.Assert(os.MkdirAll(templateDir, os.ModePerm), IsNil)

	c.Assert(ioutil.WriteFile(layoutPath, []byte(`<title>{{template "title"}}</title>`), os.ModePerm), IsNil)
	c.Assert(ioutil.WriteFile(templatePath, []byte(`{{define "title"}}foo{{end}}`), os.ModePerm), IsNil)

	rec := httptest.NewRecorder()
	renderLayout("foo.html", &templateData{}, rec)
	c.Assert(rec.Body.String(), Equals, "<title>foo</title>")
	c.Assert(rec.Code, Equals, http.StatusOK)
}

const timesyncFileName = "timesyncd.conf"

type TempNTPConfigurationFiles struct {
	timesyncdPath string
}

func (d *TempNTPConfigurationFiles) GetDefaultConfFilename() string {
	return d.timesyncdPath
}

func NewTempNTPConfigurationFilesLocator(basePath string) snappy.NTPConfigurationFiles {
	return &TempNTPConfigurationFiles{
		timesyncdPath: filepath.Join(basePath, timesyncFileName),
	}
}

func formatNTPContent(ntpServers []string) string {
	return fmt.Sprintln(`
[Time]
NTP=`, strings.Join(ntpServers, " "))
}

func mockNTPFileContent(c *C, ntpFilePath string, content string) {
	c.Assert(ioutil.WriteFile(ntpFilePath, []byte(content), 0644), IsNil)
}

func (s *HandlersSuite) TestTimeInfoHandler(c *C) {
	cwd, err := os.Getwd()
	tmpfolder := c.MkDir()

	locator := NewTempNTPConfigurationFilesLocator(tmpfolder)
	p := locator.GetDefaultConfFilename()
	ntpServer := "1.1.1.1"
	mockNTPFileContent(c, p, formatNTPContent([]string{ntpServer}))

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(s.c, locator, log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/time-info", nil)
	c.Assert(err, IsNil)

	http.DefaultServeMux.ServeHTTP(rec, req)
	body := rec.Body.String()

	var timeInfos map[string]interface{}
	err = json.Unmarshal([]byte(body), &timeInfos)
	c.Assert(err, IsNil)

	c.Check(timeInfos["date"], Matches, "\\d\\d\\d\\d-\\d\\d-\\d\\d")
	c.Check(timeInfos["time"], Matches, "\\d\\d:\\d\\d")
	c.Check(timeInfos["timezone"], FitsTypeOf, float64(0))
	c.Check(timeInfos["ntpServer"], Equals, "1.1.1.1")
}

func (s *HandlersSuite) TestModelInfoHandler(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(s.c, nil, log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/device-info", nil)
	c.Assert(err, IsNil)

	http.DefaultServeMux.ServeHTTP(rec, req)
	body := rec.Body.String()

	var deviceInfos map[string]interface{}
	err = json.Unmarshal([]byte(body), &deviceInfos)
	c.Assert(err, IsNil)

	c.Assert(deviceInfos["deviceName"], Equals, "Device name")
	c.Assert(deviceInfos["brand"], Equals, "Brand")
	c.Assert(deviceInfos["model"], Equals, "Model")
	c.Assert(deviceInfos["serial"], Equals, "Serial")
}

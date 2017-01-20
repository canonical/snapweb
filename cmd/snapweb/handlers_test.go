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
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "gopkg.in/check.v1"

	"github.com/snapcore/snapweb/snappy/app"
	"github.com/snapcore/snapweb/snappy/snapdclient"
)

func Test(t *testing.T) { TestingT(t) }

type HandlersSuite struct {
	c *snappy.FakeSnapdClient
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) createAndSaveTestToken(c *C) string {
	os.Setenv("SNAP_DATA", c.MkDir())
	tokenData := "1234"
	c.Assert(ioutil.WriteFile(filepath.Join(os.Getenv("SNAP_DATA"), "token.txt"),
		[]byte(tokenData), os.ModePerm), IsNil)

	return tokenData
}

func (s *HandlersSuite) SetUpTest(c *C) {
	s.c = &snappy.FakeSnapdClient{}

	newSnapdClient = func() snapdclient.SnapdClient {
		return s.c
	}
	s.c.Version.Version = "1000"
	s.c.Version.Series = "16"

	s.c.Err = nil

	s.createAndSaveTestToken(c)
}

func (s *HandlersSuite) TearDownTest(c *C) {
	newSnapdClient = newSnapdClientImpl
}

func (s *HandlersSuite) TestGetSnappyVersionError(c *C) {
	s.c.Err = errors.New("fail")
	c.Assert(getSnappyVersion(), Equals, "snapd")
}

func (s *HandlersSuite) TestGetSnappyVersion(c *C) {
	c.Assert(getSnappyVersion(), Equals, "snapd 1000 (series 16)")
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

	initURLHandlers(log.New(os.Stdout, "", 0))
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

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

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

func (s *HandlersSuite) TestPassthroughHandler(c *C) {
	socketPath := "/tmp/snapd-test.socket"
	c.Assert(os.MkdirAll(filepath.Dir(socketPath), 0755), IsNil)
	l, err := net.Listen("unix", socketPath)
	if err != nil {
		c.Fatalf("unable to listen on %q: %v", socketPath, err)
	}

	f := func(w http.ResponseWriter, r *http.Request) {
		c.Check(r.URL.Path, Equals, "/v2/system-info")
		c.Check(r.URL.RawQuery, Equals, "")

		fmt.Fprintln(w, `{"type":"sync", "result":{"series":"42"}}`)
	}

	srv := &httptest.Server{
		Listener: l,
		Config:   &http.Server{Handler: http.HandlerFunc(f)},
	}
	srv.Start()
	defer srv.Close()

	handler := http.HandlerFunc(makePassthroughHandler(socketPath, "/api"))

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/system-info", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	handler(rec, req)
	body := rec.Body.String()
	c.Assert(rec.Code, Equals, http.StatusOK)
	c.Check(strings.Contains(body, "42"), Equals, true)
	// TODO: check that we receive Content-Type: json/application
}

func (s *HandlersSuite) TestModelInfoHandler(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/device-info", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	body := rec.Body.String()

	var deviceInfos map[string]interface{}
	err = json.Unmarshal([]byte(body), &deviceInfos)
	c.Assert(err, IsNil)

	c.Assert(deviceInfos["deviceName"], Equals, "Device Name")
	c.Assert(deviceInfos["brand"], Equals, "Unknown")
	c.Assert(deviceInfos["model"], Equals, "Unknown")
	c.Assert(deviceInfos["serial"], Equals, "Unknown")
}

func (s *HandlersSuite) TestCheckCookieToken(c *C) {
	rec := httptest.NewRecorder()

	r, err := http.NewRequest("GET", "/api/dummy", nil)
	c.Assert(err, IsNil)

	r.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: s.createAndSaveTestToken(c)})

	handler := http.HandlerFunc(validateToken)
	handler(rec, r)
	c.Assert(rec.Code, Not(Equals), 401)
}

func (s *HandlersSuite) TestDeviceActionInvalidMethod(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/device-action", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusMethodNotAllowed)
}

func (s *HandlersSuite) TestDeviceActionInvalidContentType(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("POST", "/api/v2/device-action", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusUnsupportedMediaType)
}

func (s *HandlersSuite) TestDeviceActionInvalidJSON(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	var patchJSON = []byte("{]")
	req, err := http.NewRequest("POST", "/api/v2/device-action", bytes.NewBuffer(patchJSON))
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})
	req.Header.Set("Content-Type", "application/json")

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusBadRequest)
}

func (s *HandlersSuite) TestDeviceActionInvalidAction(c *C) {

	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	var patchJSON = []byte("{\"actionType\", \"dance\"}")
	req, err := http.NewRequest("POST", "/api/v2/device-action", bytes.NewBuffer(patchJSON))
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})
	req.Header.Set("Content-Type", "application/json")

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusBadRequest)
}

func (s *HandlersSuite) TestTimeInfoInvalidMethod(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("POST", "/api/v2/time-info", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusMethodNotAllowed)
}

func (s *HandlersSuite) TestTimeInfoGET(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/time-info", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)

	c.Assert(rec.Header().Get("Content-Type"), Equals, "application/json")

	var timeInfo map[string]interface{}
	err = json.Unmarshal([]byte(rec.Body.String()), &timeInfo)
	c.Assert(err, IsNil)

	_, exists := timeInfo["date"]
	c.Assert(exists, Equals, true)
	_, exists = timeInfo["time"]
	c.Assert(exists, Equals, true)
	_, exists = timeInfo["timezone"]
	c.Assert(exists, Equals, true)
}

func (s *HandlersSuite) TestTimeInfoInvalidContentType(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("PATCH", "/api/v2/time-info", nil)
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusUnsupportedMediaType)
}

func (s *HandlersSuite) TestTimeInfoInvalidJSON(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	var patchJSON = []byte("{]")
	req, err := http.NewRequest("PATCH", "/api/v2/time-info", bytes.NewBuffer(patchJSON))
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})
	req.Header.Set("Content-Type", "application/json")

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusBadRequest)
}

func (s *HandlersSuite) TestEmptyTimeInfoUpdate(c *C) {
	cwd, err := os.Getwd()

	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))

	initURLHandlers(log.New(os.Stdout, "", 0))
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	var patchJSON = []byte("{}")
	req, err := http.NewRequest("PATCH", "/api/v2/time-info", bytes.NewBuffer(patchJSON))
	c.Assert(err, IsNil)

	req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})
	req.Header.Set("Content-Type", "application/json")

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)
}

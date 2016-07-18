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
	"errors"
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

	newSnapdClient = func() snappy.SnapdClient {
		return s.c
	}

	s.c.Err = nil
}

func (s *HandlersSuite) TearDownTest(c *C) {
	newSnapdClient = newSnapdClientImpl
}

func (s *HandlersSuite) TestGetSnappyVersionError(c *C) {
	s.c.Err = errors.New("fail")
	c.Assert(getSnappyVersion(), Equals, "snapd")
}

func (s *HandlersSuite) TestGetSnappyVersion(c *C) {
	s.c.Version = "1000 (series 16)"
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

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

package snappy

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapweb/snappy/common"
	"github.com/snapcore/snapweb/statetracker"

	. "gopkg.in/check.v1"
)

type HandlersSuite struct {
	c *FakeSnapdClient
	h Handler
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_DATA", c.MkDir())
	s.resetFakeSnapdClient()

	s.createAndSaveTestToken(c)
}

func (s *HandlersSuite) resetFakeSnapdClient() {
	s.c = &FakeSnapdClient{}
	s.h.setClient(s.c)
	s.h.stateTracker = statetracker.New()
}

func (s *HandlersSuite) createAndSaveTestToken(c *C) string {
	os.Setenv("SNAP_DATA", c.MkDir())
	tokenData := "1234"
	c.Assert(ioutil.WriteFile(filepath.Join(os.Getenv("SNAP_DATA"), "token.txt"),
		[]byte(tokenData), os.ModePerm), IsNil)

	return tokenData
}

func (s *HandlersSuite) TestGetAllError(c *C) {
	s.c.StoreErr = errors.New("fail")

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("", mux.NewRouter()).ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusInternalServerError)
}

func (s *HandlersSuite) TestGetAll(c *C) {
	tests := []struct {
		URL             string
		CalledListSnaps bool
		Query           string
	}{
		{"/", false, "."},
		{"/?installed_only=true", true, ""},
		{"/?q=foo", false, "foo"},
		{"/?installed_only=true&q=foo", true, ""},
	}

	for _, tt := range tests {
		s.resetFakeSnapdClient()

		rec := httptest.NewRecorder()
		req, err := http.NewRequest("GET", tt.URL, nil)
		c.Assert(err, IsNil)

		s.h.getAll(rec, req)
		c.Assert(s.c.CalledListSnaps, Equals, tt.CalledListSnaps)
		c.Assert(s.c.Query, Equals, tt.Query)
	}
}

func (s *HandlersSuite) TestGetError(c *C) {
	s.c.Err = errors.New("fail")
	s.c.StoreErr = errors.New("fail")

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/foo", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("", mux.NewRouter()).ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusNotFound)
}

func (s *HandlersSuite) TestGet(c *C) {
	s.c.Snaps = []*client.Snap{common.NewDefaultSnap()}

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/chatroom", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("", mux.NewRouter()).ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)

	var sp snapPkg
	err = json.Unmarshal(rec.Body.Bytes(), &sp)
	c.Assert(err, IsNil)
	c.Assert(sp.Name, Equals, "chatroom")
}

func (s *HandlersSuite) TestAdd(c *C) {
	s.c.Snaps = []*client.Snap{common.NewDefaultSnap()}

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("PUT", "/chatroom", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("", mux.NewRouter()).ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusAccepted)
	c.Assert(s.c.Installed, Equals, "chatroom")
}

func (s *HandlersSuite) TestRemove(c *C) {
	s.c.Snaps = []*client.Snap{common.NewDefaultSnap()}

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("DELETE", "/chatroom", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("", mux.NewRouter()).ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusAccepted)
	c.Assert(s.c.Removed, Equals, "chatroom")
}

func (s *HandlersSuite) TestJsonResponseOrError(c *C) {
	type foo struct {
		S string
	}

	response := foo{"hello"}
	rec := httptest.NewRecorder()

	s.h.jsonResponseOrError(response, rec)

	c.Assert(rec.Code, Equals, http.StatusOK)
	c.Assert(rec.HeaderMap["Content-Type"][0], Equals, "application/json")

	var r foo
	err := json.Unmarshal(rec.Body.Bytes(), &r)
	c.Assert(err, IsNil)
	c.Assert(r, Equals, response)
}

func (s *HandlersSuite) TestSnapOperationResponseError(c *C) {
	rec := httptest.NewRecorder()

	s.h.snapOperationResponse("foo", errors.New("bar"), rec)

	c.Assert(rec.Code, Equals, http.StatusInternalServerError)

	var r response
	err := json.Unmarshal(rec.Body.Bytes(), &r)
	c.Assert(err, IsNil)
	c.Assert(r, DeepEquals, response{Message: "Processing error", Package: "foo"})
}

func (s *HandlersSuite) TestSnapOperationResponse(c *C) {
	rec := httptest.NewRecorder()

	s.h.snapOperationResponse("foo", nil, rec)

	c.Assert(rec.Code, Equals, http.StatusAccepted)

	var r response
	err := json.Unmarshal(rec.Body.Bytes(), &r)
	c.Assert(err, IsNil)
	c.Assert(r, DeepEquals, response{Message: "Accepted", Package: "foo"})
}

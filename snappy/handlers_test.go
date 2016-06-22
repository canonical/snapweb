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
	"net/http"
	"net/http/httptest"
	"os"

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
}

func (s *HandlersSuite) resetFakeSnapdClient() {
	s.c = &FakeSnapdClient{}
	s.h.setClient(s.c)
}

func (s *HandlersSuite) TestGetAll(c *C) {
	tests := []struct {
		URL             string
		CalledListSnaps bool
		Query           string
	}{
		{"/", false, ""},
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

func (s *HandlersSuite) TestJsonResponseOrErrorMarshalError(c *C) {
	unmarshable := map[int]int{1: 1}
	rec := httptest.NewRecorder()

	s.h.jsonResponseOrError(unmarshable, rec)

	c.Assert(rec.Code, Equals, http.StatusInternalServerError)
	c.Assert(rec.Body.String(), Matches, "Error: .*")
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

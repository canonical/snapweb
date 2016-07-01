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
	"net/http"
	"net/http/httptest"
	"os"

	"github.com/snapcore/snapd/client"
	. "gopkg.in/check.v1"

	"github.com/snapcore/snapweb/statustracker"
)

type HandlersSuite struct {
	c *FakeSnapdClient
	h Handler
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_DATA", c.MkDir())
	s.h = Handler{
		statusTracker: statustracker.New(),
	}
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

		s.h.MakeMuxer("").ServeHTTP(rec, req)

		c.Assert(s.c.CalledListSnaps, Equals, tt.CalledListSnaps)
		c.Assert(s.c.Query, Equals, tt.Query)
	}
}

func (s *HandlersSuite) TestGetInstalledSnap(c *C) {
	s.c.Snaps = []*client.Snap{newSnap("test-installed-snap")}
	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/test-installed-snap", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("").ServeHTTP(rec, req)

	dec := json.NewDecoder(rec.Body)
	var snap *client.Snap
	dec.Decode(&snap)
	c.Assert(snap.Name, Equals, "test-installed-snap")
}

func (s *HandlersSuite) TestGetStoreSnap(c *C) {
	s.c.StoreSnaps = []*client.Snap{newSnap("test-store-snap")}
	s.c.Err = errors.New("local error stub")
	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/test-store-snap", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("").ServeHTTP(rec, req)

	c.Assert(s.c.Query, Equals, "test-store-snap")
	dec := json.NewDecoder(rec.Body)
	var snap *client.Snap
	dec.Decode(&snap)
	c.Assert(snap.Name, Equals, "test-store-snap")
}

func (s *HandlersSuite) TestGetUnexistingSnap(c *C) {
	s.c.Err = errors.New("local error stub")
	s.c.StoreErr = errors.New("test store error")
	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/test-unexisting-snap", nil)
	c.Assert(err, IsNil)

	s.h.MakeMuxer("").ServeHTTP(rec, req)

	c.Assert(s.c.Query, Equals, "test-unexisting-snap")
	dec := json.NewDecoder(rec.Body)
	var m string
	dec.Decode(&m)
	c.Assert(rec.Code, Equals, 404)
	c.Assert(m, Equals, "test store error test-unexisting-snap\n")
}

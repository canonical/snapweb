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
	"net/http"
	"net/http/httptest"
	"os"

	"github.com/ubuntu-core/snappy/client"
	"launchpad.net/webdm/webprogress"

	. "gopkg.in/check.v1"
)

type HandlersSuite struct {
	c *fakeSnapdClient
	h Handler
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.statusTracker = webprogress.New()
	s.c = &fakeSnapdClient{}
	s.h.setClient(s.c)
}

func (s *HandlersSuite) TestGetAllSnapFilter(c *C) {
	filterTests := []struct {
		URL    string
		Filter client.SnapFilter
	}{
		{"/", client.SnapFilter{}},
		{"/?installed_only=true", client.SnapFilter{Sources: []string{"local"}}},
		{"/?types=app", client.SnapFilter{Types: []string{"app"}}},
		{"/?types=app,gadget", client.SnapFilter{Types: []string{"app", "gadget"}}},
		{"/?q=foo", client.SnapFilter{Query: "foo"}},
		{"/?installed_only=true&types=app&q=foo", client.SnapFilter{Sources: []string{"local"}, Types: []string{"app"}, Query: "foo"}},
	}

	for _, tt := range filterTests {
		rec := httptest.NewRecorder()
		req, err := http.NewRequest("GET", tt.URL, nil)
		c.Assert(err, IsNil)

		s.h.getAll(rec, req)
		c.Assert(s.c.filter, DeepEquals, tt.Filter)
	}
}

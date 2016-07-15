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
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
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

const (
	macaroon  = "store-root-macaroon"
	discharge = "store-discharge-macaroon"
)

func (s *HandlersSuite) TestAuthHandlerIncorrectParams(c *C) {
	urls := []string{
		"/auth?foo=bar",
		"/auth?macaroon=&discharge=",
		"/auth?macaroon=XXX&discharge=",
		"/auth?macaroon=&discharge=YYY",
	}

	for _, url := range urls {
		rec := httptest.NewRecorder()
		req, err := http.NewRequest("POST", url, nil)
		c.Assert(err, IsNil)

		authHandler(rec, req)

		c.Assert(rec.Code, Equals, http.StatusBadRequest)
	}
}

func (s *HandlersSuite) TestAuthHandler(c *C) {
	rec := httptest.NewRecorder()
	url := fmt.Sprintf("/auth?macaroon=%s&discharge=%s", macaroon, discharge)
	req, err := http.NewRequest("POST", url, nil)
	c.Assert(err, IsNil)

	authHandler(rec, req)

	// TODO: sends macaroons to snapd API via client
	c.Assert(rec.Code, Equals, http.StatusMovedPermanently)
	c.Assert(rec.HeaderMap["Location"][0], Equals, "/")
}

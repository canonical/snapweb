/*
 * Copyright (C) 2017 Canonical Ltd
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
	"net"

	. "gopkg.in/check.v1"
)

type FilterSuite struct {}

var _ = Suite(&FilterSuite{})

func (s *FilterSuite) TestFilterCreation(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)
}

func (s *FilterSuite) TestFilterAddNetwork(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)

	f.AllowNetwork("127.0.0.1/24")
	res := f.IsAllowed(net.ParseIP("127.0.0.1"))
	c.Assert(res, Equals, true)
	not := f.IsAllowed(net.ParseIP("192.168.0.1"))
	c.Assert(not, Equals, false)

	// also test ipv6 networks and addresses
	f.AllowNetwork("fd12:3456:789a:1::/64")
	ipv6 := f.IsAllowed(net.ParseIP("fd12:3456:789a:1::1"))
	c.Assert(ipv6, Equals, true)
}

func simpleHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}
}


func (s *FilterSuite) TestFilterHandleRequest(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)

	http.Handle("/", f.FilterHandler(simpleHandler()))

	rec := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	req.RemoteAddr = "127.0.0.1"

	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusForbidden)

	f.AllowNetwork("127.0.0.1/24")	
	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)

	req.RemoteAddr = "fd12:3456:789a:1::1"
	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusForbidden)

	f.AllowNetwork("fd12:3456:789a:1::/64")
	
	http.DefaultServeMux.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)
}

func (s *FilterSuite) TestGetLocalNetwork(c *C) {

	networks := getLocalNetworks()
	c.Assert(networks, NotNil)

	f := NewFilter()
	for _, n := range networks {
		f.AllowNetwork(n)
	}

	// the loopback interface should always be allowed
	res := f.IsAllowed(net.ParseIP("127.0.0.1"))
	c.Assert(res, Equals, true)
}

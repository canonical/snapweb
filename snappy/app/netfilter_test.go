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
	"net"
	"net/http"
	"net/http/httptest"

	. "gopkg.in/check.v1"
)

type FilterSuite struct{}

var _ = Suite(&FilterSuite{})

func (s *FilterSuite) TestFilterCreation(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)
	c.Assert(f.IsAllowed(nil), Equals, false)
}

func (s *FilterSuite) TestAllowInvalidNetworkCIDR(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)

	invalidCIDRs := []string{
		"",
		"11111.0.",
		"12:36:789a:1::/",
	}

	for _, cidr := range invalidCIDRs {
		c.Assert(f.AllowNetwork(cidr), NotNil)
	}
}

func (s *FilterSuite) TestFilterAddNetwork(c *C) {

	f := NewFilter()
	c.Assert(f, NotNil)

	f.AllowNetwork("127.0.0.1/24")
	res := f.IsAllowed(net.ParseIP("127.0.0.1"))
	c.Assert(res, Equals, true)

	// This second call is a "whitebox" way to use the cache
	res = f.IsAllowed(net.ParseIP("127.0.0.1"))
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
	req.RemoteAddr = "127.0.0.1:80"

	http.DefaultServeMux.ServeHTTP(rec, req)
	// Device connected networks are always authorized.
	// Thus, loopback is authorized even if not connected
	// to any
	c.Assert(rec.Code, Equals, http.StatusOK)

	rec2 := httptest.NewRecorder()
	// NOTE: take care that device where this test is
	// launched does not have 192.168.30.0 network
	// connected to any of its network interfaces.
	// Otherwise this will be taken as a valid network
	// and test will fail
	req.RemoteAddr = "192.168.30.150:80"
	http.DefaultServeMux.ServeHTTP(rec2, req)
	c.Assert(rec2.Code, Equals, http.StatusForbidden)

	rec3 := httptest.NewRecorder()
	f.AllowNetwork("192.168.30.1/8")
	http.DefaultServeMux.ServeHTTP(rec3, req)

	c.Assert(rec3.Code, Equals, http.StatusOK)

	rec4 := httptest.NewRecorder()
	req.RemoteAddr = "[fd12:3456:789a:1::1]:80"
	http.DefaultServeMux.ServeHTTP(rec4, req)
	c.Assert(rec4.Code, Equals, http.StatusForbidden)

	f.AllowNetwork("fd12:3456:789a:1::/64")

	rec5 := httptest.NewRecorder()
	http.DefaultServeMux.ServeHTTP(rec5, req)
	c.Assert(rec5.Code, Equals, http.StatusOK)
}

func (s *FilterSuite) TestAddLocalNetworks(c *C) {
	f := NewFilter()
	f.AddLocalNetworks()

	// the loopback interface should always be allowed
	res := f.IsAllowed(net.ParseIP("127.0.0.1"))
	c.Assert(res, Equals, true)
}

func (s *FilterSuite) TestAddSpecificInterface(c *C) {
	f := NewFilter()
	f.AddLocalNetworkForInterface("lo")

	// the loopback interface should always be allowed
	res := f.IsAllowed(net.ParseIP("127.0.0.1"))
	c.Assert(res, Equals, true)
}

func (s *FilterSuite) TestIPAllowedAfterNetworkUpdate(c *C) {
	f := NewFilter()
	f.AddLocalNetworks()

	res := f.IsAllowed(net.ParseIP("10.40.20.3"))
	c.Assert(res, Equals, false)

	// allow the network and re-evaluate
	f.AllowNetwork("10.40.20.0/24")

	res = f.IsAllowed(net.ParseIP("10.40.20.3"))
	c.Assert(res, Equals, true)

}

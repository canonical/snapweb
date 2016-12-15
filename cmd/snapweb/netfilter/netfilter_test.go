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

package netfilter

import (
	"net"
	"testing"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type NetFilterSuite struct {
	f *NetFilter
}

var _ = Suite(&NetFilterSuite{})

func (s *NetFilterSuite) SetUpTest(c *C) {
	s.f = New()
}

func (s *NetFilterSuite) TearDownTest(c *C) {
	s.f = nil
}

func (s *NetFilterSuite) TestNetFilterCreation(c *C) {

	c.Assert(s.f, NotNil)

	g := NewAndAllowByDefault()
	c.Assert(g, NotNil)
}

func (s *NetFilterSuite) TestNetFilterAddRules(c *C) {
	c.Assert(s.f, NotNil)

	res := s.f.Allow("127.0.0.1")
	c.Check(res, Equals, true)
	
	res = s.f.Allow("127.0.0.1/24")
	c.Check(res, Equals, true)

	res = s.f.Allow("127.0.0.1/24")
	c.Check(res, Equals, true)

	res = s.f.Block("192.168.0.0/24")
	c.Check(res, Equals, true)
}

func (s *NetFilterSuite) TestNetFilterCheckRules(c *C) {
	c.Assert(s.f, NotNil)

	s.f.Allow("127.0.0.1")
	s.f.Block("192.168.0.0/24")

	c.Check(s.f.IsAllowed(net.ParseIP("127.0.0.1")), Equals, true)
	c.Check(s.f.IsAllowed(net.ParseIP("127.0.0.2")), Equals, false)
	c.Check(s.f.IsAllowed(net.ParseIP("192.168.0.1")), Equals, true)
	c.Check(s.f.IsAllowed(net.ParseIP("192.0.0.1")), Equals, false)
}

/*
var privateRanges = []ipRange{
    ipRange{
        start: net.ParseIP("10.0.0.0"),
        end:   net.ParseIP("10.255.255.255"),
    },
    ipRange{
        start: net.ParseIP("100.64.0.0"),
        end:   net.ParseIP("100.127.255.255"),
    },
    ipRange{
        start: net.ParseIP("172.16.0.0"),
        end:   net.ParseIP("172.31.255.255"),
    },
    ipRange{
        start: net.ParseIP("192.0.0.0"),
        end:   net.ParseIP("192.0.0.255"),
    },
    ipRange{
        start: net.ParseIP("192.168.0.0"),
        end:   net.ParseIP("192.168.255.255"),
    },
    ipRange{
        start: net.ParseIP("198.18.0.0"),
        end:   net.ParseIP("198.19.255.255"),
    },
}
*/

/*
 * Copyright (C) 2014-2015 Canonical Ltd
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

package avahi

import (
	"io/ioutil"
	"log"
	"net"
	"os"
	"testing"

	"github.com/davecheney/mdns"
	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type stubAddr struct {
	address string
}

func (a stubAddr) Network() string {
	return ""
}

func (a stubAddr) String() string {
	return a.address
}

type AvahiSuite struct {
	publish []string
}

var _ = Suite(&AvahiSuite{})

func (s *AvahiSuite) SetUpTest(c *C) {
	logger = log.New(ioutil.Discard, "", 0)

	mdnsPublish = func(rr string) error { s.publish = append(s.publish, rr); return nil }
	osHostname = func() (string, error) { return "localhost", nil }
}

func (s *AvahiSuite) TearDownTest(c *C) {
	mdnsPublish = mdns.Publish
	osHostname = os.Hostname
	netInterfaceAddrs = net.InterfaceAddrs
	s.publish = nil
}

func (s *AvahiSuite) TestLoopLocalAddressOnly(c *C) {
	netInterfaceAddrs = func() ([]net.Addr, error) {
		return []net.Addr{&stubAddr{"127.0.0.1"}}, nil
	}

	loop()
	c.Check(s.publish, HasLen, 0)
}

func (s *AvahiSuite) TestLoopLocalCNetwork(c *C) {
	netInterfaceAddrs = func() ([]net.Addr, error) {
		return []net.Addr{&stubAddr{"192.168.1.1"}}, nil
	}

	loop()
	c.Assert(s.publish, HasLen, 1)
	c.Assert(s.publish[0], Equals, "snapweb.local. 60 IN A 192.168.1.1")
}

func (s *AvahiSuite) TestLoopLocalCAndv6Network(c *C) {
	netInterfaceAddrs = func() ([]net.Addr, error) {
		return []net.Addr{&stubAddr{"192.168.1.1"}, &stubAddr{"fe80::5054:ff:fe12:3456"}}, nil
	}

	loop()
	c.Assert(s.publish, HasLen, 2)
	c.Assert(s.publish[0], Equals, "snapweb.local. 60 IN A 192.168.1.1")
	c.Assert(s.publish[1], Equals, "snapweb.local. 60 IN A fe80::5054:ff:fe12:3456")
}

func (s *AvahiSuite) TestLoopLocalCNetworkOtherHostname(c *C) {
	osHostname = func() (string, error) { return "other.something", nil }
	netInterfaceAddrs = func() ([]net.Addr, error) {
		return []net.Addr{&stubAddr{"192.168.1.1"}}, nil
	}

	loop()
	c.Assert(s.publish, HasLen, 1)
	c.Assert(s.publish[0], Equals, "other.local. 60 IN A 192.168.1.1")
}

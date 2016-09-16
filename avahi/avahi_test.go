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
	"os"
	"testing"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type AvahiSuite struct {
	mockHostname string
}

var _ = Suite(&AvahiSuite{})

func (s *AvahiSuite) SetUpTest(c *C) {
	logger = log.New(ioutil.Discard, "", 0)

	osHostname = func() (string, error) { return s.mockHostname, nil }
}

func (s *AvahiSuite) TearDownTest(c *C) {
	osHostname = os.Hostname
}

func (s *AvahiSuite) TestGetHostname(c *C) {
	s.mockHostname = "localhost"
	c.Check(getHostname(), Equals, hostnameDefault)

	s.mockHostname = "something-else"
	c.Check(getHostname(), Equals, "something-else")
}

/*
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
	c.Assert(s.publish[0], Equals, "webdm.local. 60 IN A 192.168.1.1")
}

func (s *AvahiSuite) TestLoopLocalCAndv6Network(c *C) {
	netInterfaceAddrs = func() ([]net.Addr, error) {
		return []net.Addr{&stubAddr{"192.168.1.1"}, &stubAddr{"fe80::5054:ff:fe12:3456"}}, nil
	}

	loop()
	c.Assert(s.publish, HasLen, 2)
	c.Assert(s.publish[0], Equals, "webdm.local. 60 IN A 192.168.1.1")
	c.Assert(s.publish[1], Equals, "webdm.local. 60 IN A fe80::5054:ff:fe12:3456")
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
*/

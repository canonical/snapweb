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

package main

import (
	"os"
	"time"

	"github.com/snapcore/snapweb/snappy"

	. "gopkg.in/check.v1"
)

type MainSuite struct{}

var _ = Suite(&MainSuite{})

var mockManagedState = false

func mockIsDeviceManaged() bool {
	return mockManagedState
}

func (s *MainSuite) TestBlockUntilManaged(c *C) {
	os.Setenv("SNAP_DATA", c.MkDir())

	ready := make(chan bool)
	done := make(chan bool)
	
	go func() {
		ready <- true
		blockOn(mockIsDeviceManaged)
		done <- true
	}()

	// a signal cannot unblock snapweb until the system is managed
	mockManagedState = false
	<-ready
	time.Sleep(1000) // give time to install the signal handler
	snappy.SendSignalToSnapweb()
	select {
	case <-done:
		c.Fail()
	default:
	}
	
	// try to unblock once the system has changed
	mockManagedState = true
	snappy.SendSignalToSnapweb()
	result := <-done
	
	c.Assert(result, Equals, true)
}

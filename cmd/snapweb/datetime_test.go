/*
 * Copyright (C) 2016-2017 Canonical Ltd
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
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/godbus/dbus"
	. "gopkg.in/check.v1"
)

const timesyncFileName = "timesyncd.conf"

func mockNTPFileContent(c *C, ntpFilePath string, content string) {
	c.Assert(ioutil.WriteFile(ntpFilePath, []byte(content), 0644), IsNil)
}

func formatNTPContent(ntpServers []string) string {
	return fmt.Sprintln(`
[Time]
NTP=`, strings.Join(ntpServers, " "))
}

type ReadNtpSuite struct {
	ntpFilePath string
}

var _ = Suite(&ReadNtpSuite{})

func (s *ReadNtpSuite) SetUpTest(c *C) {
	s.ntpFilePath = c.MkDir()
}

func (s *ReadNtpSuite) TestReadNonExistentNTP(c *C) {
	timesyncdConfigurationFilePath = filepath.Join(s.ntpFilePath, timesyncFileName)
	c.Check(readNTPServer(), Equals, "")
}

func (s *ReadNtpSuite) TestReadInvalidNTP(c *C) {
	timesyncdConfigurationFilePath = filepath.Join(s.ntpFilePath, timesyncFileName)
	mockNTPFileContent(c, timesyncdConfigurationFilePath, "")
	c.Check(readNTPServer(), Equals, "")
	mockNTPFileContent(c, timesyncdConfigurationFilePath, "invalid")
	c.Check(readNTPServer(), Equals, "")
	mockNTPFileContent(c, timesyncdConfigurationFilePath, "[Time]\n")
	c.Check(readNTPServer(), Equals, "")
}

func (s *ReadNtpSuite) TestReadValidNTP(c *C) {
	timesyncdConfigurationFilePath = filepath.Join(s.ntpFilePath, timesyncFileName)
	ntpServer := "1.1.1.1"
	mockNTPFileContent(c,
		timesyncdConfigurationFilePath,
		formatNTPContent([]string{ntpServer}))
	c.Check(readNTPServer(), Equals, ntpServer)

	mockNTPFileContent(c,
		timesyncdConfigurationFilePath,
		formatNTPContent([]string{""}))
	c.Check(readNTPServer(), Equals, "")
}

func (s *ReadNtpSuite) TestWriteValidNTP(c *C) {
	timesyncdConfigurationFilePath = filepath.Join(s.ntpFilePath, timesyncFileName)
	var ntpServer interface{} = "1.1.1.1 2.2.2.2"
	mockNTPFileContent(c,
		timesyncdConfigurationFilePath,
		formatNTPContent([]string{""}))

	c.Assert(setTimeInfo(map[string]interface{}{"ntpServer": ntpServer}), IsNil)
	ntpServer = "2.2.2.2"

	c.Assert(setTimeInfo(map[string]interface{}{"ntpServer": ntpServer}), IsNil)
	c.Check(readNTPServer(), Equals, ntpServer)

	c.Assert(setTimeInfo(map[string]interface{}{"ntpServer": ""}), IsNil)
	c.Check(readNTPServer(), Equals, "1.1.1.1")

	mockNTPFileContent(c,
		timesyncdConfigurationFilePath,
		"[Time]")

	c.Assert(setTimeInfo(map[string]interface{}{"ntpServer": ""}), IsNil)
	c.Check(readNTPServer(), Equals, "")

	c.Assert(setTimeInfo(map[string]interface{}{"ntpServer": "1.1.1.1"}), IsNil)
	c.Check(readNTPServer(), Equals, "1.1.1.1")
}

func (s *ReadNtpSuite) TestUpdateTimeZone(c *C) {
	oldCallDbusEndpoint := callDbusEndpoint
	callDbusEndpoint = func(o dbus.BusObject, target string, v interface{}) error {
		return nil
	}
	defer func() {
		callDbusEndpoint = oldCallDbusEndpoint
	}()

	c.Assert(setTimeInfo(map[string]interface{}{"timezone": "America/Toronto"}), IsNil)
	c.Assert(setTimeInfo(map[string]interface{}{"timezone": 1}), NotNil)
}

func (s *ReadNtpSuite) TestUpdateTime(c *C) {
	oldCallDbusEndpoint := callDbusEndpoint
	callDbusEndpoint = func(o dbus.BusObject, target string, v interface{}) error {
		return nil
	}
	defer func() {
		callDbusEndpoint = oldCallDbusEndpoint
	}()

	c.Assert(setTimeInfo(map[string]interface{}{"dateTime": 1555001.0}), IsNil)
	c.Assert(setTimeInfo(map[string]interface{}{"dateTime": ""}), NotNil)
}

func (s *ReadNtpSuite) TestUpdateNtpFlag(c *C) {
	oldCallDbusEndpoint := callDbusEndpoint
	callDbusEndpoint = func(o dbus.BusObject, target string, v interface{}) error {
		return nil
	}
	defer func() {
		callDbusEndpoint = oldCallDbusEndpoint
	}()

	c.Assert(setTimeInfo(map[string]interface{}{"ntp": false}), IsNil)
	c.Assert(setTimeInfo(map[string]interface{}{"ntp": ""}), NotNil)
}

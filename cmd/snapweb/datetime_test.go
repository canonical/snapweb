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
}

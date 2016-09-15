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
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"

	. "gopkg.in/check.v1"
)

const timesyncFileName = "timesyncd.conf"

type TempNTPConfigurationFiles struct {
	timesyncdPath string
}

func (d *TempNTPConfigurationFiles) GetDefaultConfFilename() string {
	return d.timesyncdPath
}

func NewTempNTPConfigurationFilesLocator(basePath string) NTPConfigurationFiles {
	return &TempNTPConfigurationFiles{
		timesyncdPath: filepath.Join(basePath, timesyncFileName),
	}
}

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
	locator := NewTempNTPConfigurationFilesLocator(s.ntpFilePath)
	c.Check(readNTPServer(locator), Equals, "")
}

func (s *ReadNtpSuite) TestReadInvalidNTP(c *C) {
	locator := NewTempNTPConfigurationFilesLocator(s.ntpFilePath)
	p := locator.GetDefaultConfFilename()
	mockNTPFileContent(c, p, "")
	c.Check(readNTPServer(locator), Equals, "")
	mockNTPFileContent(c, p, "invalid")
	c.Check(readNTPServer(locator), Equals, "")
	mockNTPFileContent(c, p, "[Time]\n")
	c.Check(readNTPServer(locator), Equals, "")
}

func (s *ReadNtpSuite) TestReadValidNTP(c *C) {
	locator := NewTempNTPConfigurationFilesLocator(s.ntpFilePath)
	p := locator.GetDefaultConfFilename()
	ntpServer := "1.1.1.1"
	mockNTPFileContent(c, p, formatNTPContent([]string{ntpServer}))
	c.Check(readNTPServer(locator), Equals, ntpServer)
}

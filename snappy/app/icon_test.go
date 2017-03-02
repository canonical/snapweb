/*
 * Copyright (C) 2014-2016 Canonical Ltd
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
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/snapcore/snapd/client"

	"github.com/snapcore/snapweb/snappy/snapdclient"

	. "gopkg.in/check.v1"
)

type IconSuite struct {
	dataPath string
}

var _ = Suite(&IconSuite{})

func (s *IconSuite) SetUpTest(c *C) {
	s.dataPath = c.MkDir()
	os.Setenv("SNAP_DATA", s.dataPath)
}

func (s *IconSuite) TestIconDir(c *C) {
	iconDir, relativePath, err := IconDir()
	c.Assert(err, IsNil)
	c.Check(iconDir, Equals, filepath.Join(s.dataPath, "icons"))
	c.Check(relativePath, Equals, "icons")
}

func (s *IconSuite) TestNoSnapAppDataPathDoesNotCauseError(c *C) {
	os.Setenv("SNAP_DATA", "")
	str, _, err := IconDir()
	c.Assert(err, Equals, nil)
	c.Assert(str, Equals, "icons")
}

func (s *IconSuite) TestLocateCachedDataWhenNoSnapDataExists(c *C) {
	os.Setenv("SNAP_DATA", "")
	str, err := tryLocateCachedIconForSnap("")
	c.Assert(err, Not(Equals), nil)
	c.Assert(str, Equals, "")
}

func (s *IconSuite) TestIconDirCreateFails(c *C) {
	fileAsDir := filepath.Join(s.dataPath, "badDataPath")
	c.Assert(ioutil.WriteFile(fileAsDir, []byte{}, 0644), IsNil)
	os.Setenv("SNAP_DATA", fileAsDir)
	_, _, err := IconDir()
	c.Assert(err, Equals, ErrOnIconDataPathSet)
}

type IconPathSuite struct {
	snapdclient.SnapdClient
	dataPath string
	err      error
}

func (s *IconPathSuite) Icon(name string) (*client.Icon, error) {
	icon := &client.Icon{
		Filename: "pkgIcon.png",
		Content:  []byte("png"),
	}
	return icon, s.err
}

var _ = Suite(&IconPathSuite{})

func (s *IconPathSuite) SetUpTest(c *C) {
	s.dataPath = c.MkDir()
	os.Setenv("SNAP_DATA", s.dataPath)
	s.err = nil
}

func (s *IconPathSuite) TestIconCopy(c *C) {
	relativePath, err := localIconPath(s, "mypackage")
	c.Assert(err, IsNil)
	iconBaseName := "icons/mypackage_pkgIcon.png"
	c.Check(relativePath, Equals, filepath.Join("/", iconBaseName))

	contents, err := ioutil.ReadFile(filepath.Join(s.dataPath, iconBaseName))
	c.Assert(err, IsNil)

	c.Assert(string(contents), Equals, "png")
}

func (s *IconPathSuite) TestIconCopyBadDataPath(c *C) {
	fileAsDir := filepath.Join(s.dataPath, "badDataPath")
	c.Assert(ioutil.WriteFile(fileAsDir, []byte{}, 0644), IsNil)
	os.Setenv("SNAP_DATA", fileAsDir)
	_, err := localIconPath(s, "mypackage")
	c.Assert(err, Equals, ErrOnIconDataPathSet)
}

func (s *IconPathSuite) TestIconCopyNoIcon(c *C) {
	s.err = errors.New("Not Found")
	_, err := localIconPath(s, "mypackage")
	c.Assert(err, Equals, ErrIconNotExist)
}

func (s *IconPathSuite) TestIconCopyTargetIconExists(c *C) {
	iconBaseName := "icons/mypackage_pkgIcon.png"
	c.Assert(os.MkdirAll(filepath.Join(s.dataPath, "icons"), 0755), IsNil)
	c.Assert(ioutil.WriteFile(filepath.Join(s.dataPath, iconBaseName), []byte{}, 0644), IsNil)

	relativePath, err := localIconPath(s, "mypackage")
	c.Assert(err, IsNil)
	c.Check(relativePath, Equals, filepath.Join("/", iconBaseName))
}

func (s *IconSuite) TestLocateCachedIconError(c *C) {
	c.Assert(os.MkdirAll(filepath.Join(s.dataPath, "icons"), 0755), IsNil)

	str, err := tryLocateCachedIconForSnap("snap")

	c.Assert(err, Equals, ErrIconNotExist)
	c.Assert(str, Equals, "")
}

func (s *IconSuite) TestLocateCachedIcons(c *C) {
	trials := []struct {
		iconName string
		name     string
		success  bool
	}{
		{"icons/mysnap_pkgIcon.png", "mysnap", true},
		{"icons/mysnap_pkgIcon.png", "notmysnap", false},
		{"icons/notmysnap_.", "mysnap", false},
		{"icons/mysnap_pkgIconpng", "mysnap", false},
	}

	c.Assert(os.MkdirAll(filepath.Join(s.dataPath, "icons"), 0755), IsNil)

	for _, t := range trials {
		iconFilePath := filepath.Join(s.dataPath, t.iconName)
		c.Assert(ioutil.WriteFile(iconFilePath, []byte{}, 0644), IsNil)

		str, err := tryLocateCachedIconForSnap(t.name)

		fmt.Println(t.iconName, str, err)
		if t.success {
			c.Assert(err, Equals, nil)
			c.Assert(str, Equals, fmt.Sprintf("/icons/%s_pkgIcon.png", t.name))
		} else {
			c.Assert(err, Not(Equals), nil)
			c.Assert(str, Equals, "")
		}
		os.Remove(iconFilePath)
	}
}

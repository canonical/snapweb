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
	"github.com/ubuntu-core/snappy/client"
	"github.com/ubuntu-core/snappy/snap"

	. "gopkg.in/check.v1"
)

type PackagePartSuite struct {
	pkg     client.Package
	pkgPart packagePart
}

var _ = Suite(&PackagePartSuite{})

func (s *PackagePartSuite) SetUpTest(c *C) {
	s.pkg = client.Package{
		Description:   "WebRTC Video chat server for Snappy",
		DownloadSize:  6930947,
		Icon:          "/1.0/icons/chatroom.ogra/icon",
		InstalledSize: 18976651,
		Name:          "chatroom",
		Origin:        "ogra",
		Status:        client.StatusActive,
		Type:          client.TypeApp,
		Version:       "0.1-8",
	}
	s.pkgPart = packagePart{s.pkg}
}

func (s *PackagePartSuite) TestPackagePart(c *C) {
	c.Assert(s.pkgPart.Name(), Equals, s.pkg.Name)
	c.Assert(s.pkgPart.Version(), Equals, s.pkg.Version)
	c.Assert(s.pkgPart.Origin(), Equals, s.pkg.Origin)
	c.Assert(s.pkgPart.Description(), Equals, s.pkg.Description)
	c.Assert(s.pkgPart.InstalledSize(), Equals, s.pkg.InstalledSize)
	c.Assert(s.pkgPart.DownloadSize(), Equals, s.pkg.DownloadSize)
	c.Assert(s.pkgPart.Icon(), Equals, s.pkg.Icon)
	c.Assert(s.pkgPart.IsInstalled(), Equals, true)
	c.Assert(s.pkgPart.Type(), Equals, snap.TypeApp)
}

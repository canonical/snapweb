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

type SnapPartSuite struct {
	snap     client.Snap
	snapPart snapPart
}

var _ = Suite(&SnapPartSuite{})

func (s *SnapPartSuite) SetUpTest(c *C) {
	s.snap = client.Snap{
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
	s.snapPart = snapPart{s.snap}
}

func (s *SnapPartSuite) TestPackagePart(c *C) {
	c.Assert(s.snapPart.Name(), Equals, s.snap.Name)
	c.Assert(s.snapPart.Version(), Equals, s.snap.Version)
	c.Assert(s.snapPart.Origin(), Equals, s.snap.Origin)
	c.Assert(s.snapPart.Description(), Equals, s.snap.Description)
	c.Assert(s.snapPart.InstalledSize(), Equals, s.snap.InstalledSize)
	c.Assert(s.snapPart.DownloadSize(), Equals, s.snap.DownloadSize)
	c.Assert(s.snapPart.Icon(), Equals, s.snap.Icon)
	c.Assert(s.snapPart.IsInstalled(), Equals, true)
	c.Assert(s.snapPart.Type(), Equals, snap.TypeApp)
}

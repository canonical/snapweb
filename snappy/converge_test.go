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

package snappy

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"

	. "gopkg.in/check.v1"
	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/webprogress"
)

type PayloadSuite struct {
	h Handler
}

var _ = Suite(&PayloadSuite{})

func (s *PayloadSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.installStatus = webprogress.New()
}

func (s *PayloadSuite) TestPayloadWithNoServices(c *C) {
	fakeSnap := newDefaultFakePart()
	icon := filepath.Join(c.MkDir(), "icon.png")
	c.Assert(ioutil.WriteFile(icon, []byte{}, 0644), IsNil)
	fakeSnap.icon = icon

	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
	c.Assert(q.Icon, Equals, "/icons/camlistore.sergiusens_icon.png")
}

func (s *PayloadSuite) TestPayloadWithServicesButNoUI(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesNoExternalUI()
	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
}

func (s *PayloadSuite) TestPayloadWithServicesUI(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesWithExternalUI()
	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(1024))
	c.Assert(q.UIUri, Equals, "")
}

func (s *PayloadSuite) TestPayloadTypeOem(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesWithExternalUI()
	fakeSnap.snapType = snappy.SnapTypeOem

	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
}

type MergeSuite struct {
	h Handler
}

var _ = Suite(&MergeSuite{})

func (s *MergeSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.installStatus = webprogress.New()
}

func (s *MergeSuite) TestOneInstalledAndNoRemote(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", true)),
	}

	snaps := mergeSnaps(installed, nil, true)

	c.Assert(snaps, HasLen, 1)
	c.Assert(snaps[0].Name, Equals, "app1.canonical")
	c.Assert(snaps[0].Version, Equals, "1.0")
	c.Assert(snaps[0].Status, Equals, webprogress.StatusInstalled)

	snaps = mergeSnaps(installed, nil, false)
	c.Assert(snaps, HasLen, 1)
}

func (s *MergeSuite) TestManyInstalledAndNoRemote(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2.canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3.canonical", "3.0", true)),
	}

	snaps := mergeSnaps(installed, nil, true)
	sort.Sort(snapPkgsByName(snaps))

	c.Assert(snaps, HasLen, 3)
	c.Assert(snaps[0].Name, Equals, "app1.canonical")
	c.Assert(snaps[0].Version, Equals, "1.0")
	c.Assert(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Assert(snaps[1].Name, Equals, "app2.canonical")
	c.Assert(snaps[1].Version, Equals, "2.0")
	c.Assert(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Assert(snaps[2].Name, Equals, "app3.canonical")
	c.Assert(snaps[2].Version, Equals, "3.0")
	c.Assert(snaps[2].Status, Equals, webprogress.StatusInstalled)
}

func (s *MergeSuite) TestManyInstalledAndManyRemotes(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2.canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3.canonical", "3.0", true)),
	}

	remotes := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", false)),
		s.h.snapQueryToPayload(newFakePart("app2.canonical", "2.0", false)),
		s.h.snapQueryToPayload(newFakePart("app3.ubuntu", "3.0", false)),
	}

	// Only installed
	snaps := mergeSnaps(installed, remotes, true)
	sort.Sort(snapPkgsByName(snaps))

	c.Assert(snaps, HasLen, 3)
	c.Check(snaps[0].Name, Equals, "app1.canonical")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[1].Name, Equals, "app2.canonical")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[2].Name, Equals, "app3.canonical")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)

	// Installed and remotes
	snaps = mergeSnaps(installed, remotes, false)
	sort.Sort(snapPkgsByName(snaps))

	c.Assert(snaps, HasLen, 4)
	c.Check(snaps[0].Name, Equals, "app1.canonical")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[1].Name, Equals, "app2.canonical")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[2].Name, Equals, "app3.canonical")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[3].Name, Equals, "app3.ubuntu")
	c.Check(snaps[3].Version, Equals, "3.0")
	c.Check(snaps[3].Status, Equals, webprogress.StatusUninstalled)
}

func (s *MergeSuite) TestManyInstalledAndManyRemotesSomeInstalling(c *C) {
	s.h.installStatus.Add("app4.ubuntu")

	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2.canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3.canonical", "3.0", true)),
	}

	remotes := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1.canonical", "1.0", false)),
		s.h.snapQueryToPayload(newFakePart("app4.ubuntu", "2.0", false)),
		s.h.snapQueryToPayload(newFakePart("app5.ubuntu", "3.0", false)),
	}

	// Installed and remotes
	snaps := mergeSnaps(installed, remotes, false)
	sort.Sort(snapPkgsByName(snaps))

	c.Assert(snaps, HasLen, 5)
	c.Check(snaps[0].Name, Equals, "app1.canonical")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[1].Name, Equals, "app2.canonical")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[2].Name, Equals, "app3.canonical")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[3].Name, Equals, "app4.ubuntu")
	c.Check(snaps[3].Version, Equals, "2.0")
	c.Check(snaps[3].Status, Equals, webprogress.StatusInstalling)

	c.Check(snaps[4].Name, Equals, "app5.ubuntu")
	c.Check(snaps[4].Version, Equals, "3.0")
	c.Check(snaps[4].Status, Equals, webprogress.StatusUninstalled)
}

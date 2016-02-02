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
	"os"

	"github.com/ubuntu-core/snappy/client"
	"github.com/ubuntu-core/snappy/snap"
	. "gopkg.in/check.v1"
	"launchpad.net/webdm/webprogress"
)

type PackagePayloadSuite struct {
	h Handler
	c *fakeSnapdClient
}

var _ = Suite(&PackagePayloadSuite{})

func (s *PackagePayloadSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.statusTracker = webprogress.New()
	s.c = &fakeSnapdClient{}
	s.h.setClient(s.c)
}

func (s *PackagePayloadSuite) TestPackageNotFound(c *C) {
	s.c.err = errors.New("the snap could not be retrieved")

	_, err := s.h.packagePayload("chatroom.ogra")
	c.Assert(err, NotNil)
}

func (s *PackagePayloadSuite) TestPackage(c *C) {
	s.c.snaps = []*client.Snap{newDefaultSnap()}

	pkg, err := s.h.packagePayload("chatroom.ogra")
	c.Assert(err, IsNil)
	c.Assert(pkg, DeepEquals, snapPkg{
		ID:            "chatroom.ogra",
		Description:   "WebRTC Video chat server for Snappy",
		DownloadSize:  0,
		Icon:          "/icons/chatroom.ogra_icon.png",
		InstalledSize: 18976651,
		Name:          "chatroom",
		Origin:        "ogra",
		Status:        "installed",
		Type:          "app",
		Version:       "0.1-8",
	})
}

type PayloadSuite struct {
	h Handler
}

var _ = Suite(&PayloadSuite{})

func (s *PayloadSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.statusTracker = webprogress.New()
	s.h.setClient(&fakeSnapdClient{})
}

func (s *PayloadSuite) TestPayloadWithNoServices(c *C) {
	fakeSnap := newDefaultFakePart()

	q := s.h.snapQueryToPayload(fakeSnap)

	c.Check(q.Name, Equals, fakeSnap.name)
	c.Check(q.Version, Equals, fakeSnap.version)
	c.Check(q.Status, Equals, webprogress.StatusInstalled)
	c.Check(q.Type, Equals, fakeSnap.snapType)
	c.Check(q.UIPort, Equals, uint64(0))
	c.Check(q.Icon, Equals, "/icons/camlistore.sergiusens_icon.png")
	c.Check(q.Description, Equals, fakeSnap.description)
}

func (s *PayloadSuite) TestPayloadWithServicesButNoUI(c *C) {
	s.h.setClient(&fakeSnapdClientServicesNoExternalUI{})

	fakeSnap := newDefaultFakePart()
	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
}

func (s *PayloadSuite) TestPayloadWithServicesUI(c *C) {
	s.h.setClient(&fakeSnapdClientServicesExternalUI{})

	fakeSnap := newDefaultFakePart()
	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(1024))
}

func (s *PayloadSuite) TestPayloadTypeGadget(c *C) {
	s.h.setClient(&fakeSnapdClientServicesExternalUI{})

	fakeSnap := newDefaultFakePart()
	fakeSnap.snapType = snap.TypeGadget

	q := s.h.snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Status, Equals, webprogress.StatusInstalled)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
}

type MergeSuite struct {
	h Handler
}

var _ = Suite(&MergeSuite{})

func (s *MergeSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
	s.h.statusTracker = webprogress.New()
	s.h.setClient(&fakeSnapdClient{})
}

func (s *MergeSuite) TestOneInstalledAndNoRemote(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", true)),
	}

	snaps := mergeSnaps(installed, nil, true)

	c.Assert(snaps, HasLen, 1)
	c.Assert(snaps[0].Name, Equals, "app1")
	c.Assert(snaps[0].Version, Equals, "1.0")
	c.Assert(snaps[0].Status, Equals, webprogress.StatusInstalled)

	snaps = mergeSnaps(installed, nil, false)
	c.Assert(snaps, HasLen, 1)
}

func (s *MergeSuite) TestManyInstalledAndNoRemote(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2", "canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3", "canonical", "3.0", true)),
	}

	snaps := mergeSnaps(installed, nil, true)

	c.Assert(snaps, HasLen, 3)
	c.Assert(snaps[0].Name, Equals, "app1")
	c.Assert(snaps[0].Version, Equals, "1.0")
	c.Assert(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Assert(snaps[1].Name, Equals, "app2")
	c.Assert(snaps[1].Version, Equals, "2.0")
	c.Assert(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Assert(snaps[2].Name, Equals, "app3")
	c.Assert(snaps[2].Version, Equals, "3.0")
	c.Assert(snaps[2].Status, Equals, webprogress.StatusInstalled)
}

func (s *MergeSuite) TestManyInstalledAndManyRemotes(c *C) {
	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2", "canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3", "canonical", "3.0", true)),
	}

	remotes := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", false)),
		s.h.snapQueryToPayload(newFakePart("app2", "canonical", "2.0", false)),
		s.h.snapQueryToPayload(newFakePart("app4", "ubuntu", "3.0", false)),
	}

	// Only installed
	snaps := mergeSnaps(installed, remotes, true)

	c.Assert(snaps, HasLen, 3)
	c.Check(snaps[0].Name, Equals, "app1")
	c.Check(snaps[0].Origin, Equals, "canonical")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[0].InstalledSize, Equals, int64(30))
	c.Check(snaps[0].DownloadSize, Equals, int64(0))

	c.Check(snaps[1].Name, Equals, "app2")
	c.Check(snaps[1].Origin, Equals, "canonical")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[1].InstalledSize, Equals, int64(30))
	c.Check(snaps[1].DownloadSize, Equals, int64(0))

	c.Check(snaps[2].Name, Equals, "app3")
	c.Check(snaps[0].Origin, Equals, "canonical")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[2].InstalledSize, Equals, int64(30))
	c.Check(snaps[2].DownloadSize, Equals, int64(0))

	// Installed and remotes
	snaps = mergeSnaps(installed, remotes, false)

	c.Assert(snaps, HasLen, 4)
	c.Check(snaps[0].Name, Equals, "app1")
	c.Check(snaps[0].Origin, Equals, "canonical")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[0].InstalledSize, Equals, int64(30))
	c.Check(snaps[0].DownloadSize, Equals, int64(0))

	c.Check(snaps[1].Name, Equals, "app2")
	c.Check(snaps[1].Origin, Equals, "canonical")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[1].InstalledSize, Equals, int64(30))
	c.Check(snaps[1].DownloadSize, Equals, int64(0))

	c.Check(snaps[2].Name, Equals, "app3")
	c.Check(snaps[2].Origin, Equals, "canonical")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)
	c.Check(snaps[2].InstalledSize, Equals, int64(30))
	c.Check(snaps[2].DownloadSize, Equals, int64(0))

	c.Check(snaps[3].Name, Equals, "app4")
	c.Check(snaps[3].Origin, Equals, "ubuntu")
	c.Check(snaps[3].Version, Equals, "3.0")
	c.Check(snaps[3].Status, Equals, webprogress.StatusUninstalled)
	c.Check(snaps[3].InstalledSize, Equals, int64(0))
	c.Check(snaps[3].DownloadSize, Equals, int64(60))
}

func (s *MergeSuite) TestManyInstalledAndManyRemotesSomeInstalling(c *C) {
	s.h.statusTracker.Add("app4.ubuntu", webprogress.OperationInstall)

	installed := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", true)),
		s.h.snapQueryToPayload(newFakePart("app2", "canonical", "2.0", true)),
		s.h.snapQueryToPayload(newFakePart("app3", "canonical", "3.0", true)),
	}

	remotes := []snapPkg{
		s.h.snapQueryToPayload(newFakePart("app1", "canonical", "1.0", false)),
		s.h.snapQueryToPayload(newFakePart("app4", "ubuntu", "2.0", false)),
		s.h.snapQueryToPayload(newFakePart("app5", "ubuntu", "3.0", false)),
	}

	// Installed and remotes
	snaps := mergeSnaps(installed, remotes, false)

	c.Assert(snaps, HasLen, 5)
	c.Check(snaps[0].Name, Equals, "app1")
	c.Check(snaps[0].Version, Equals, "1.0")
	c.Check(snaps[0].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[1].Name, Equals, "app2")
	c.Check(snaps[1].Version, Equals, "2.0")
	c.Check(snaps[1].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[2].Name, Equals, "app3")
	c.Check(snaps[2].Version, Equals, "3.0")
	c.Check(snaps[2].Status, Equals, webprogress.StatusInstalled)

	c.Check(snaps[3].Name, Equals, "app4")
	c.Check(snaps[3].Version, Equals, "2.0")
	c.Check(snaps[3].Status, Equals, webprogress.StatusInstalling)
	c.Check(snaps[3].InstalledSize, Equals, int64(0))
	c.Check(snaps[3].DownloadSize, Equals, int64(60))

	c.Check(snaps[4].Name, Equals, "app5")
	c.Check(snaps[4].Version, Equals, "3.0")
	c.Check(snaps[4].Status, Equals, webprogress.StatusUninstalled)
	c.Check(snaps[4].InstalledSize, Equals, int64(0))
	c.Check(snaps[4].DownloadSize, Equals, int64(60))
}

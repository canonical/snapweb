package snappy

import (
	"io/ioutil"
	"os"
	"path/filepath"

	. "gopkg.in/check.v1"
	"launchpad.net/snappy/snappy"
)

type PayloadSuite struct{}

var _ = Suite(&PayloadSuite{})

func (s *PayloadSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", c.MkDir())
}

func (s *PayloadSuite) TestPayloadWithNoServices(c *C) {
	fakeSnap := newDefaultFake()
	icon := filepath.Join(c.MkDir(), "icon.png")
	c.Assert(ioutil.WriteFile(icon, []byte{}, 0644), IsNil)
	fakeSnap.icon = icon

	q := snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Installed, Equals, fakeSnap.installed)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
	c.Assert(q.Icon, Equals, "/icons/camlistore.sergiusens_icon.png")
}

func (s *PayloadSuite) TestPayloadWithServicesButNoUI(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesNoExternalUI()
	q := snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Installed, Equals, fakeSnap.installed)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
}

func (s *PayloadSuite) TestPayloadWithServicesUI(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesWithExternalUI()
	q := snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Installed, Equals, fakeSnap.installed)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(1024))
	c.Assert(q.UIUri, Equals, "")
}

func (s *PayloadSuite) TestPayloadTypeOem(c *C) {
	fakeSnap := newDefaultFakeServices()
	fakeSnap.services = newFakeServicesWithExternalUI()
	fakeSnap.snapType = snappy.SnapTypeOem

	q := snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Installed, Equals, fakeSnap.installed)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
}

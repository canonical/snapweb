package snappy

import (
	. "gopkg.in/check.v1"
	"launchpad.net/snappy/snappy"
)

type PayloadSuite struct{}

var _ = Suite(&PayloadSuite{})

func (s *PayloadSuite) TestPayloadWithNoServices(c *C) {
	fakeSnap := newDefaultFake()

	q := snapQueryToPayload(fakeSnap)

	c.Assert(q.Name, Equals, fakeSnap.name)
	c.Assert(q.Version, Equals, fakeSnap.version)
	c.Assert(q.Installed, Equals, fakeSnap.installed)
	c.Assert(q.Type, Equals, fakeSnap.snapType)
	c.Assert(q.UIPort, Equals, uint64(0))
	c.Assert(q.UIUri, Equals, "")
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

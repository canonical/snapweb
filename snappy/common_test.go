package snappy

import (
	"testing"

	"launchpad.net/snappy/snappy"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type fakeSnappyPart struct {
	name      string
	version   string
	installed bool
	icon      string
	snapType  snappy.SnapType
}

type fakeSnappyPartServices struct {
	fakeSnappyPart
	services []snappy.Service
}

func newDefaultFake() *fakeSnappyPart {
	return &fakeSnappyPart{
		name:      "camlistore.sergiusens",
		version:   "2.0",
		installed: true,
		snapType:  snappy.SnapTypeApp,
	}
}

func newParametrizedFake(name, version string, installed bool, snapType snappy.SnapType) *fakeSnappyPart {
	return &fakeSnappyPart{
		name:      name,
		version:   version,
		installed: installed,
		snapType:  snapType,
	}
}

func newDefaultFakeServices() *fakeSnappyPartServices {
	return &fakeSnappyPartServices{
		fakeSnappyPart: fakeSnappyPart{
			name:      "camlistore.sergiusens",
			version:   "2.0",
			installed: true,
			snapType:  snappy.SnapTypeApp,
		},
	}
}

func (p fakeSnappyPartServices) Services() []snappy.Service {
	return p.services
}

func (p fakeSnappyPart) IsInstalled() bool {
	return p.installed
}

func (p fakeSnappyPart) Name() string {
	return p.name
}

func (p fakeSnappyPart) Version() string {
	return p.version
}

func (p fakeSnappyPart) Type() snappy.SnapType {
	return p.snapType
}

func (p fakeSnappyPart) Icon() string {
	return p.icon
}

func newFakeServicesNoExternalUI() []snappy.Service {
	services := make([]snappy.Service, 0, 2)

	internal1 := map[string]snappy.Port{"ui": snappy.Port{Port: "200/tcp"}}
	external1 := map[string]snappy.Port{"web": snappy.Port{Port: "1024/tcp"}}
	s1 := snappy.Service{
		Name: "s1",
		Ports: &snappy.Ports{
			Internal: internal1,
			External: external1,
		},
	}
	services = append(services, s1)

	s2 := snappy.Service{
		Name: "s2",
	}
	services = append(services, s2)

	return services
}

func newFakeServicesWithExternalUI() []snappy.Service {
	services := make([]snappy.Service, 0, 2)

	s1 := snappy.Service{
		Name: "s2",
	}
	services = append(services, s1)

	internal2 := map[string]snappy.Port{"ui": snappy.Port{Port: "200/tcp"}}
	external2 := map[string]snappy.Port{"ui": snappy.Port{Port: "1024/tcp"}}
	s2 := snappy.Service{
		Name: "s1",
		Ports: &snappy.Ports{
			Internal: internal2,
			External: external2,
		},
	}
	services = append(services, s2)

	return services
}

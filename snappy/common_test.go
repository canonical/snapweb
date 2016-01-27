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
	"testing"

	"github.com/ubuntu-core/snappy/snap"
	"github.com/ubuntu-core/snappy/snappy"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type fakeSnappyPart struct {
	snappy.Part
	name        string
	origin      string
	version     string
	description string
	installed   bool
	icon        string
	snapType    snap.Type
}

type fakeSnappyPartServices struct {
	fakeSnappyPart
	serviceYamls []snappy.ServiceYaml
}

func newDefaultFakePart() *fakeSnappyPart {
	return &fakeSnappyPart{
		name:        "camlistore",
		origin:      "sergiusens",
		version:     "2.0",
		installed:   true,
		snapType:    snap.TypeApp,
		description: "Camlistore",
	}
}

func newFakePart(name, origin, version string, installed bool) *fakeSnappyPart {
	return &fakeSnappyPart{
		name:      name,
		origin:    origin,
		version:   version,
		installed: installed,
		snapType:  snap.TypeApp,
	}
}

func newParametrizedFake(name, version string, installed bool, snapType snap.Type) *fakeSnappyPart {
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
			name:      "camlistore",
			origin:    "sergiusens",
			version:   "2.0",
			installed: true,
			snapType:  snap.TypeApp,
		},
	}
}

func (p fakeSnappyPartServices) ServiceYamls() []snappy.ServiceYaml {
	return p.serviceYamls
}

func (p fakeSnappyPart) IsInstalled() bool {
	return p.installed
}

func (p fakeSnappyPart) InstalledSize() int64 {
	if p.installed {
		return 30
	}

	return -1
}

func (p fakeSnappyPart) DownloadSize() int64 {
	if !p.installed {
		return 60
	}

	return -1
}

func (p fakeSnappyPart) Name() string {
	return p.name
}

func (p fakeSnappyPart) Origin() string {
	return p.origin
}

func (p fakeSnappyPart) Version() string {
	return p.version
}

func (p fakeSnappyPart) Type() snap.Type {
	return p.snapType
}

func (p fakeSnappyPart) Icon() string {
	return p.icon
}

func (p fakeSnappyPart) Description() string {
	return p.description
}

func newFakeServicesNoExternalUI() []snappy.ServiceYaml {
	services := make([]snappy.ServiceYaml, 0, 2)

	internal1 := map[string]snappy.Port{"ui": snappy.Port{Port: "200/tcp"}}
	external1 := map[string]snappy.Port{"web": snappy.Port{Port: "1024/tcp"}}
	s1 := snappy.ServiceYaml{
		Name: "s1",
		Ports: &snappy.Ports{
			Internal: internal1,
			External: external1,
		},
	}
	services = append(services, s1)

	s2 := snappy.ServiceYaml{
		Name: "s2",
	}
	services = append(services, s2)

	return services
}

func newFakeServicesWithExternalUI() []snappy.ServiceYaml {
	services := make([]snappy.ServiceYaml, 0, 2)

	s1 := snappy.ServiceYaml{
		Name: "s2",
	}
	services = append(services, s1)

	internal2 := map[string]snappy.Port{"ui": snappy.Port{Port: "200/tcp"}}
	external2 := map[string]snappy.Port{"ui": snappy.Port{Port: "1024/tcp"}}
	s2 := snappy.ServiceYaml{
		Name: "s1",
		Ports: &snappy.Ports{
			Internal: internal2,
			External: external2,
		},
	}
	services = append(services, s2)

	return services
}

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
	"testing"

	"github.com/ubuntu-core/snappy/client"
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

type fakeSnapdClient struct {
	snaps  []*client.Snap
	err    error
	filter client.SnapFilter
}

func newDefaultSnap() *client.Snap {
	snap := &client.Snap{
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
	return snap
}

func (f *fakeSnapdClient) Icon(pkgID string) (*client.Icon, error) {
	icon := &client.Icon{
		Filename: "icon.png",
		Content:  []byte("png"),
	}
	return icon, nil
}

func (f *fakeSnapdClient) Services(pkg string) (map[string]*client.Service, error) {
	return nil, errors.New("the package has no services")
}

func (f *fakeSnapdClient) Snap(name string) (*client.Snap, error) {
	if len(f.snaps) > 0 {
		return f.snaps[0], f.err
	}
	return nil, f.err
}

func (f *fakeSnapdClient) FilterSnaps(filter client.SnapFilter) (map[string]*client.Snap, error) {
	f.filter = filter // record the filter used

	snaps := make(map[string]*client.Snap)
	for _, s := range f.snaps {
		snaps[s.Name] = s
	}

	return snaps, f.err
}

var _ snapdClient = (*fakeSnapdClient)(nil)

type fakeSnapdClientServicesNoExternalUI struct {
	fakeSnapdClient
}

func (f *fakeSnapdClientServicesNoExternalUI) Services(pkg string) (map[string]*client.Service, error) {
	internal := map[string]client.ServicePort{"ui": client.ServicePort{Port: "200/tcp"}}
	external := map[string]client.ServicePort{"web": client.ServicePort{Port: "1024/tcp"}}
	s1 := &client.Service{
		Spec: client.ServiceSpec{
			Ports: client.ServicePorts{
				Internal: internal,
				External: external,
			},
		},
	}

	s2 := &client.Service{}

	services := map[string]*client.Service{
		"s1": s1,
		"s2": s2,
	}

	return services, nil
}

type fakeSnapdClientServicesExternalUI struct {
	fakeSnapdClient
}

func (f *fakeSnapdClientServicesExternalUI) Services(pkg string) (map[string]*client.Service, error) {
	s1 := &client.Service{}

	internal := map[string]client.ServicePort{"ui": client.ServicePort{Port: "200/tcp"}}
	external := map[string]client.ServicePort{"ui": client.ServicePort{Port: "1024/tcp"}}
	s2 := &client.Service{
		Spec: client.ServiceSpec{
			Ports: client.ServicePorts{
				Internal: internal,
				External: external,
			},
		},
	}

	services := map[string]*client.Service{
		"s1": s1,
		"s2": s2,
	}

	return services, nil
}

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
	"github.com/snapcore/snapd/client"
)

// FakeSnapdClient is a fake SnapdClient for testing purposes
type FakeSnapdClient struct {
	Snaps           []*client.Snap
	Err             error
	CalledListSnaps bool
	Query           string
	Version         string
}

func (f *FakeSnapdClient) Icon(name string) (*client.Icon, error) {
	icon := &client.Icon{
		Filename: "icon.png",
		Content:  []byte("png"),
	}
	return icon, nil
}

func (f *FakeSnapdClient) Snap(name string) (*client.Snap, *client.ResultInfo, error) {
	if len(f.Snaps) > 0 {
		return f.Snaps[0], nil, f.Err
	}
	return nil, nil, f.Err
}

func (f *FakeSnapdClient) ListSnaps(names []string) ([]*client.Snap, error) {
	f.CalledListSnaps = true

	return f.Snaps, f.Err
}

func (f *FakeSnapdClient) FindSnaps(query string) ([]*client.Snap, *client.ResultInfo, error) {
	f.Query = query

	return f.Snaps, nil, f.Err
}

func (f *FakeSnapdClient) Install(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

func (f *FakeSnapdClient) Remove(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

func (f *FakeSnapdClient) ServerVersion() (string, error) {
	return f.Version, f.Err
}

var _ SnapdClient = (*FakeSnapdClient)(nil)

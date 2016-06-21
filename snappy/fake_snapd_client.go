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
	StoreSnaps      []*client.Snap
	Err             error
	StoreErr        error
	CalledListSnaps bool
	Query           string
	Version         string
}

// Icon returns the icon of an installed snap
func (f *FakeSnapdClient) Icon(name string) (*client.Icon, error) {
	icon := &client.Icon{
		Filename: "icon.png",
		Content:  []byte("png"),
	}
	return icon, nil
}

// Snap returns the named snap
func (f *FakeSnapdClient) Snap(name string) (*client.Snap, *client.ResultInfo, error) {
	if len(f.Snaps) > 0 {
		return f.Snaps[0], nil, f.Err
	}
	return nil, nil, f.Err
}

// List lists the installed snaps
func (f *FakeSnapdClient) List(names []string) ([]*client.Snap, error) {
	f.CalledListSnaps = true

	return f.Snaps, f.Err
}

// Find returns the results of searching for snaps with the given options
func (f *FakeSnapdClient) Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error) {
	f.Query = opts.Query

	return f.StoreSnaps, nil, f.StoreErr
}

// Install adds the named snap to the system
func (f *FakeSnapdClient) Install(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

// Remove removes the names snap from the system
func (f *FakeSnapdClient) Remove(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

// ServerVersion returns the version of the running `snapd` daemon
func (f *FakeSnapdClient) ServerVersion() (string, error) {
	return f.Version, f.Err
}

var _ SnapdClient = (*FakeSnapdClient)(nil)

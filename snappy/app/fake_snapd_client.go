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
	"github.com/snapcore/snapd/asserts"
	"github.com/snapcore/snapd/client"

	"github.com/snapcore/snapweb/snappy/snapdclient"
)

// FakeSnapdClient is a fake SnapdClient for testing purposes
type FakeSnapdClient struct {
	Snaps           []*client.Snap
	StoreSnaps      []*client.Snap
	Err             error
	StoreErr        error
	CalledListSnaps bool
	Query           string
	FindOptions     *client.FindOptions
	Version         client.ServerVersion
	Installed       string
	Removed         string
	CrUser          client.CreateUserResult
	Name            string
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
func (f *FakeSnapdClient) List(names []string, opts *client.ListOptions) ([]*client.Snap, error) {
	f.CalledListSnaps = true

	return f.Snaps, f.Err
}

// Find returns the results of searching for snaps with the given options
func (f *FakeSnapdClient) Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error) {
	f.Query = opts.Query
	f.FindOptions = opts

	return f.StoreSnaps, nil, f.StoreErr
}

// Install adds the named snap to the system
func (f *FakeSnapdClient) Install(name string, options *client.SnapOptions) (string, error) {
	f.Installed = name

	return "", nil
}

// Remove removes the names snap from the system
func (f *FakeSnapdClient) Remove(name string, options *client.SnapOptions) (string, error) {
	f.Removed = name

	return "", nil
}

// ServerVersion returns the version of the running `snapd` daemon
func (f *FakeSnapdClient) ServerVersion() (*client.ServerVersion, error) {
	return &f.Version, f.Err
}

// SetCoreConfig sets some aspect of core configuration
func (f *FakeSnapdClient) SetCoreConfig(patch map[string]interface{}) (string, error) {
	return "", nil
}

// GetCoreConfig gets some aspect of core configuration
func (f *FakeSnapdClient) GetCoreConfig(keys []string) (map[string]interface{}, error) {
	return nil, nil
}

// CreateUser creates a local user on the system
func (f *FakeSnapdClient) CreateUser(request *client.CreateUserOptions) (*client.CreateUserResult, error) {
	return &f.CrUser, f.Err
}

// Interfaces returns the list of supported interfaces on the system
func (f *FakeSnapdClient) Interfaces() (client.Interfaces, error) {
	return client.Interfaces{}, nil
}

// Known queries assertions with type assertTypeName and matching assertion headers.
func (f *FakeSnapdClient) Known(assertTypeName string, headers map[string]string) ([]asserts.Assertion, error) {
	return nil, nil
}

// Sections returns the list of existing sections in the store.
func (f *FakeSnapdClient) Sections() ([]string, error) {
	return nil, nil
}

// FindOne returns a list of snaps available for install from the
// store for this system and that match the query
func (f *FakeSnapdClient) FindOne(name string) (*client.Snap, *client.ResultInfo, error) {
	f.Name = name

	for _, v := range f.StoreSnaps {
		if v.Name == name {
			return v, nil, nil
		}
	}
	return nil, nil, f.StoreErr
}

// Change returns the list of ongoing changes for a given snap and changeid
func (f *FakeSnapdClient) Change(id string) (*client.Change, error) {
	return nil, nil
}

// Enable enables the snap
func (f *FakeSnapdClient) Enable(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

// Disable disables the snap
func (f *FakeSnapdClient) Disable(name string, options *client.SnapOptions) (string, error) {
	return "", nil
}

var _ snapdclient.SnapdClient = (*FakeSnapdClient)(nil)

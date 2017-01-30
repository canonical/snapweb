/*
 * Copyright (C) 2014-2017 Canonical Ltd
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

package common

import (
	"testing"

	"github.com/snapcore/snapd/client"

	"gopkg.in/check.v1"
)

// Test runs all the tests defined in the testsuite
func Test(t *testing.T) { check.TestingT(t) }

// NewDefaultSnap creates a default snap structure
func NewDefaultSnap() *client.Snap {
	snap := &client.Snap{
		Description:   "WebRTC Video chat server for Snappy",
		DownloadSize:  6930947,
		Icon:          "/1.0/icons/chatroom.ogra/icon",
		InstalledSize: 18976651,
		Name:          "chatroom",
		Developer:     "ogra",
		Status:        client.StatusActive,
		Type:          client.TypeApp,
		Version:       "0.1-8",
		Private:       false,
	}
	return snap
}

// NewSnap creates a snap structure based on a snap name
func NewSnap(name string) *client.Snap {
	snap := NewDefaultSnap()
	snap.Name = name
	return snap
}

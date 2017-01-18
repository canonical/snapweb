/*
 * Copyright (C) 2016-2017 Canonical Ltd
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

package statetracker

import (
	"testing"
	"time"

	"github.com/snapcore/snapd/client"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type StateTrackerSuite struct {
	t *StateTracker
}

var _ = Suite(&StateTrackerSuite{})

func (s *StateTrackerSuite) SetUpTest(c *C) {
	s.t = New()
}

func (s *StateTrackerSuite) TestTranslateStatus(c *C) {
	tests := []struct {
		snapStatus string
		status     string
	}{
		{client.StatusInstalled, StatusInstalled},
		{client.StatusActive, StatusActive},
		{client.StatusAvailable, StatusUninstalled},
		{client.StatusRemoved, StatusUninstalled},
	}

	for _, tt := range tests {
		snap := &client.Snap{Status: tt.snapStatus}
		c.Assert(translateStatus(snap), Equals, tt.status)
	}
}

func (s *StateTrackerSuite) TestHasCompleted(c *C) {
	tests := []struct {
		status     string
		snapStatus string
		completed  bool
	}{
		{StatusInstalling, client.StatusInstalled, true},
		{StatusInstalling, client.StatusRemoved, false},
		{StatusUninstalling, client.StatusRemoved, true},
		{StatusUninstalling, client.StatusActive, false},
	}

	for _, tt := range tests {
		snap := &client.Snap{Status: tt.snapStatus}
		c.Assert(hasCompleted(tt.status, snap), Equals, tt.completed)
	}
}

func (s *StateTrackerSuite) TestUntrackedSnap(c *C) {
	snap := &client.Snap{Status: client.StatusInstalled}
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusInstalled})
}

func (s *StateTrackerSuite) TestTrackInstallAlreadyInstalled(c *C) {
	snap := &client.Snap{Status: client.StatusInstalled}
	s.t.TrackInstall("", snap)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusInstalled})
}

func (s *StateTrackerSuite) TestTrackInstall(c *C) {
	snap := &client.Snap{Status: client.StatusAvailable}
	s.t.TrackInstall("", snap)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusInstalling})
	// installation completes
	snap.Status = client.StatusActive
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusActive})
}

func (s *StateTrackerSuite) TestTrackInstallExpiry(c *C) {
	trackerDuration = 200 * time.Millisecond

	snap := &client.Snap{Status: client.StatusAvailable}
	s.t.TrackInstall("", snap)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusInstalling})

	// don't track indefinitely if operation fails
	time.Sleep(trackerDuration * 2)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusUninstalled})
}

func (s *StateTrackerSuite) TestTrackUninstallNotInstalled(c *C) {
	snap := &client.Snap{Status: client.StatusAvailable}
	s.t.TrackUninstall("", snap)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusUninstalled})
}

func (s *StateTrackerSuite) TestTrackUninstall(c *C) {
	snap := &client.Snap{Status: client.StatusInstalled}
	s.t.TrackUninstall("", snap)
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusUninstalling})
	// uninstallation completes
	snap.Status = client.StatusRemoved
	c.Assert(s.t.State(nil, snap), DeepEquals, &SnapState{Status: StatusUninstalled})
}

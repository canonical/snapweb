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

// Package statetracker enables the tracking of a limited amount
// of snap states during long running snap operations:
// - installation/removal (current download progress during install, ...)
// - enabling/disabling of snaps,
//
// Note: Once a snap has been marked as "installing" it will remain in that
// state until it's status as provided by snapd indicates that it is installed
// on the system. Similarly for removing snaps. Status lifecycle is thus:
//
// "uninstalled" -> "installing" -> "installed" -> "uninstalling" and repeat
package statetracker

import (
	"sync"
	"time"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapd/overlord/state"

	"github.com/snapcore/snapweb/snappy/snapdclient"
)

const (
	// StatusPriced indicates the package is priced and has not been bought.
	StatusPriced = "priced"
	// StatusInstalled indicates the package is in an installed state but disabled.
	StatusInstalled = "installed"
	// StatusActive indicates the package is in an installed and enabled state.
	StatusActive = "active"
	// StatusUninstalled indicates the package is in an uninstalled state.
	StatusUninstalled = "uninstalled"
	// StatusInstalling indicates the package is in an installing state.
	StatusInstalling = "installing"
	// StatusUninstalling indicates the package is in an uninstalling state.
	StatusUninstalling = "uninstalling"
	// StatusEnabling indicates the package is in an enabling state.
	StatusEnabling = "enabling"
	// StatusDisabling indicates the package is in an disabling state.
	StatusDisabling = "disabling"
)

// TODO: naive approach to track big downloads
var trackerDuration = 2 * time.Minute

// SnapState encapsulate the currently tracked snap state
type SnapState struct {
	Status      string
	ChangeID    string
	LocalSize   uint64
	TaskSummary string
}

type snapStatePerID map[string]SnapState

// StateTracker tracks snap states
type StateTracker struct {
	sync.Mutex
	states snapStatePerID
}

// New returns a new status tracker
func New() *StateTracker {
	return &StateTracker{
		states: make(snapStatePerID),
	}
}

// State returns the state of the given snap
func (s *StateTracker) State(c snapdclient.SnapdClient, snap *client.Snap) *SnapState {
	s.Lock()
	defer s.Unlock()

	cstate, ok := s.states[snap.Name]
	if !ok {
		return &SnapState{
			Status: translateStatus(snap),
		}
	}

	if changing, changeID := s.IsTrackedForRunningOperation(snap); changing && c != nil {
		change, err := c.Change(changeID)

		if err == nil {
			for _, task := range change.Tasks {
				if uint64(task.Progress.Done) > 1 {
					cstate.LocalSize = uint64(task.Progress.Done)
				}
				if task.Status != state.DoingStatus.String() {
					continue
				}
				cstate.TaskSummary = task.Summary
				break
			}
		}
	}

	if hasOperationCompleted(cstate.Status, snap) {
		delete(s.states, snap.Name)
		return &SnapState{
			Status: translateStatus(snap),
		}
	}

	return &cstate
}

// IsTrackedForRunningOperation checks if a given snap is currently concerned by
// by a running operation
func (s *StateTracker) IsTrackedForRunningOperation(snap *client.Snap) (bool, string) {
	state, ok := s.states[snap.Name]
	if !ok {
		return false, ""
	}

	return !hasOperationCompleted(state.Status, snap), state.ChangeID
}

// TrackInstall tracks the installation of the given snap
func (s *StateTracker) TrackInstall(changeID string, snap *client.Snap) {
	if isInstalled(snap) {
		return
	}

	if tracked, _ := s.IsTrackedForRunningOperation(snap); tracked {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusInstalling)
}

// TrackUninstall tracks the removal of the given snap
func (s *StateTracker) TrackUninstall(changeID string, snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	if tracked, _ := s.IsTrackedForRunningOperation(snap); tracked {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusUninstalling)
}

// TrackEnable tracks the installation of the given snap
func (s *StateTracker) TrackEnable(changeID string, snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	if tracked, _ := s.IsTrackedForRunningOperation(snap); tracked {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusEnabling)
}

// TrackDisable tracks the disabling of the given snap
func (s *StateTracker) TrackDisable(changeID string, snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	if tracked, _ := s.IsTrackedForRunningOperation(snap); tracked {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusDisabling)
}

func (s *StateTracker) trackOperation(changeID, name, operation string) {
	s.Lock()
	defer s.Unlock()

	s.states[name] = SnapState{
		Status:   operation,
		ChangeID: changeID,
	}

	go func() {
		<-time.After(trackerDuration)
		s.Lock()
		delete(s.states, name)
		s.Unlock()
	}()
}

func isInstalled(s *client.Snap) bool {
	return s.Status == client.StatusInstalled || s.Status == client.StatusActive
}

// translate a status from the snappy world into one webdm understands
func translateStatus(s *client.Snap) string {
	switch s.Status {
	case client.StatusInstalled:
		return StatusInstalled
	case client.StatusActive:
		return StatusActive
	case "priced":
		return StatusPriced
	}

	return StatusUninstalled
}

// has the tracked process denoted by status completed?
func hasOperationCompleted(s string, snap *client.Snap) bool {
	if s == StatusInstalling {
		return isInstalled(snap)
	}
	if s == StatusEnabling {
		return snap.Status == client.StatusActive
	}
	if s == StatusDisabling {
		return snap.Status == client.StatusInstalled
	}

	return !isInstalled(snap)
}

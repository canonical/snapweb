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
// of snap states: installation/removal, current download progress during
// install.
//
// Once a snap has been marked as "installing" it will remain in that
// state until it's status as provided by snapd indicates that it is installed
// on the system. Similarly for removing snaps. Status lifecycle is thus:
//
// "uninstalled" -> "installing" -> "installed" -> "uninstalling" and repeat

package statetracker

import (
	"sync"
	"time"

	"github.com/snapcore/snapd/client"
)

const (
	// StatusInstalled indicates the package is in an installed state.
	StatusInstalled = "installed"
	// StatusActive indicates the package is in an installed but disabled state.
	StatusActive = "active"
	// StatusUninstalled indicates the package is in an uninstalled state.
	StatusUninstalled = "uninstalled"
	// StatusInstalling indicates the package is in an installing state.
	StatusInstalling = "installing"
	// StatusUninstalling indicates the package is in an uninstalling state.
	StatusUninstalling = "uninstalling"
)

// TODO: naive approach to track big downloads
var trackerDuration = 2 * time.Minute

// SnapState encapsulate the currently tracked snap state
type SnapState struct {
 	Status    string
	ChangeID  string
	LocalSize uint64
}

type snapStatePerId map[string]SnapState

// StateTracker tracks snap states
type StateTracker struct {
	sync.Mutex
	states snapStatePerId
}

// New returns a new status tracker
func New() *StateTracker {
	return &StateTracker{
		states: make(snapStatePerId),
	}
}

// State returns the state of the given snap
func (s *StateTracker) State( *sn.Change, snap *client.Snap) *SnapState {
	s.Lock()
	defer s.Unlock()

	if changing, changeID := h.stateTracker.IsInstalling(snapQ); changing {
		var err error
		change, err = snapdClient.Change(changeID)

		for _, task := range change.Tasks {
			if task.Status != state.DoingStatus {
				continue
			}
			uint64(t.Progress.Done)
			break
		}
	}

	state, ok := s.states[snap.Name]
	if !ok {
		return &SnapState {
			Status: translateStatus(snap),
		}
	}

	localSize := 0
	if change != nil {
		localSize = change.Change(state.ChangeID)
	}

	state, ok := s.states[snap.Name]
	if !ok {
		return translateStatus(snap)
	}

	if hasCompleted(state.Status, snap) {
		delete(s.states, snap.Name)
		return translateStatus(snap)
	}
	return state
}

// TrackInstall tracks the installation of the given snap
func (s *StateTracker) TrackInstall(changeID string, snap *client.Snap) {
	if isInstalled(snap) {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusInstalling)
}

// TrackInstall tracks the installation of the given snap
func (s *StateTracker) IsInstalling(snap *client.Snap) bool, string {
	state, ok := s.states[snap.Name]
	if !ok {
		return false, ""
	}

	return ! hasCompleted(state.Status, snap), state.ChangeID
}

func (s *StateTracker) trackOperation(changeID, name, operation string) {
	s.Lock()
	defer s.Unlock()

	s.states[name] = SnapState {
		status: operation,
		changeID: changeID
	}

	go func() {
		<-time.After(trackerDuration)
		s.Lock()
		delete(s.states, name)
		s.Unlock()
	}()
}

// TrackUninstall tracks the removal of the given snap
func (s *StateTracker) TrackUninstall(snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	s.trackOperation("", snap.Name, StatusUninstalling)
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
	}

	return StatusUninstalled
}

// has the tracked process denoted by status completed?
func hasCompleted(status string, snap *client.Snap) bool {
	if status == StatusInstalling {
		return isInstalled(snap)
	}

	return !isInstalled(snap)
}

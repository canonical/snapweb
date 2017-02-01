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

	if changing, changeID := s.IsInstalling(snap); changing && c != nil {
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

	if hasCompleted(cstate.Status, snap) {
		delete(s.states, snap.Name)
		return &SnapState{
			Status: translateStatus(snap),
		}
	}

	return &cstate
}

// TrackInstall tracks the installation of the given snap
func (s *StateTracker) TrackInstall(changeID string, snap *client.Snap) {
	if isInstalled(snap) {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusInstalling)
}

// IsInstalling checks if a given snap is being installed
func (s *StateTracker) IsInstalling(snap *client.Snap) (bool, string) {
	state, ok := s.states[snap.Name]
	if !ok {
		return false, ""
	}

	return !hasCompleted(state.Status, snap), state.ChangeID
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

// TrackUninstall tracks the removal of the given snap
func (s *StateTracker) TrackUninstall(changeID string, snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	s.trackOperation(changeID, snap.Name, StatusUninstalling)
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
func hasCompleted(status string, snap *client.Snap) bool {
	if status == StatusInstalling {
		return isInstalled(snap)
	}

	return !isInstalled(snap)
}

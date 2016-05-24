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

// Package statustracker enables the tracking of snap installation and removal.
//
// Once a snap has been marked as "installing" it will remain in that
// state until it's status as provided by snapd indicates that it is installed
// on the system. Similarly for removing snaps. Status lifecycle is thus:
//
// "uninstalled" -> "installing" -> "installed" -> "uninstalling" and repeat
package statustracker

import (
	"sync"
	"time"

	"github.com/snapcore/snapd/client"
)

const (
	// StatusInstalled indicates the package is in an installed state.
	StatusInstalled = "installed"
	// StatusUninstalled indicates the package is in an uninstalled state.
	StatusUninstalled = "uninstalled"
	// StatusInstalling indicates the package is in an installing state.
	StatusInstalling = "installing"
	// StatusUninstalling indicates the package is in an uninstalling state.
	StatusUninstalling = "uninstalling"
)

var trackerDuration = 1 * time.Minute

// StatusTracker tracks statuses
type StatusTracker struct {
	sync.Mutex
	statuses map[string]string
}

// New returns a new status tracker
func New() *StatusTracker {
	return &StatusTracker{
		statuses: make(map[string]string),
	}
}

// Status returns the status of the given snap
func (s *StatusTracker) Status(snap *client.Snap) string {
	s.Lock()
	defer s.Unlock()

	status, ok := s.statuses[snap.Name]
	if !ok {
		return translateStatus(snap)
	}

	if hasCompleted(status, snap) {
		delete(s.statuses, snap.Name)
		return translateStatus(snap)
	}

	return status
}

// TrackInstall tracks the installation of the given snap
func (s *StatusTracker) TrackInstall(snap *client.Snap) {
	if isInstalled(snap) {
		return
	}

	s.trackOperation(snap.Name, StatusInstalling)
}

func (s *StatusTracker) trackOperation(name, operation string) {
	s.Lock()
	defer s.Unlock()

	s.statuses[name] = operation

	go func() {
		<-time.After(trackerDuration)
		s.Lock()
		delete(s.statuses, name)
		s.Unlock()
	}()
}

// TrackUninstall tracks the removal of the given snap
func (s *StatusTracker) TrackUninstall(snap *client.Snap) {
	if !isInstalled(snap) {
		return
	}

	s.trackOperation(snap.Name, StatusUninstalling)
}

func isInstalled(s *client.Snap) bool {
	return s.Status == client.StatusInstalled || s.Status == client.StatusActive
}

// translate a status from the snappy world into one webdm understands
func translateStatus(s *client.Snap) string {
	if isInstalled(s) {
		return StatusInstalled
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

/*
 * Copyright (C) 2014-2015 Canonical Ltd
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

package webprogress

import "launchpad.net/snappy/progress"

// Operation indicates the desired operation to perform
type Operation uint

const (
	// OperationInstall indicates that a package needs installing
	OperationInstall Operation = iota
	// OperationRemove indicates that a package needs uninstalling
	OperationRemove
)

// Status indicates the status a package is in.
type Status string

const (
	// StatusInstalled indicates the package is in an installed state.
	StatusInstalled Status = "installed"
	// StatusUninstalled indicates the package is in an uninstalled state.
	StatusUninstalled = "uninstalled"
	// StatusInstalling indicates the package is in an installing state.
	StatusInstalling = "installing"
	// StatusUninstalling indicates the package is in an uninstalling state.
	StatusUninstalling = "uninstalling"
)

// WebProgress show progress on the terminal
type WebProgress struct {
	progress.Meter
	total               float64
	current             float64
	Status              Status
	statusMessage       string
	notificationMessage string
	Error               error
	ErrorChan           chan error
	operation           Operation
}

// NewWebProgress returns a new WebProgress type
func NewWebProgress(op Operation) *WebProgress {
	var status Status
	switch op {
	case OperationInstall:
		status = StatusInstalling
	case OperationRemove:
		status = StatusUninstalling
	default:
		panic("Not a valid Operation")
	}

	t := &WebProgress{
		ErrorChan: make(chan error),
		Status:    status,
		operation: op,
	}

	go func() {
		err := <-t.ErrorChan

		if err != nil {
			t.Status = StatusUninstalled
			t.Error = err
		} else {
			t.Status = StatusInstalled
		}
	}()

	return t
}

// Start starts showing progress
func (t *WebProgress) Start(total float64) {
	t.total = total
}

// Set sets the progress to the current value
func (t *WebProgress) Set(current float64) {
	t.current = current
}

// SetTotal set the total steps needed
func (t *WebProgress) SetTotal(total float64) {
	t.total = total
}

// Finished stops displaying the progress
func (t *WebProgress) Finished() {
}

// Done returns a boolean value indicating that the progress report
// has finished with no concerns if it was succesfull or not.
func (t *WebProgress) Done() bool {
	return t.Status == StatusInstalled || t.Status == StatusUninstalled
}

// Write is there so that progress can implement a Writer and can be
// used to display progress of io operations
//
// This is not needed for web progress.
func (t *WebProgress) Write(p []byte) (n int, err error) {
	t.current += float64(len(p))
	return len(p), nil
}

// Spin advances a spinner, i.e. can be used to show progress for operations
// that have a unknown duration
func (t *WebProgress) Spin(msg string) {
	t.statusMessage = msg
}

// Agreed asks the user whether they agree to the given license text
func (t *WebProgress) Agreed(intro, license string) bool {
	// TODO needs implementation
	return true
}

// Notify the user of miscelaneous events
func (t *WebProgress) Notify(msg string) {
	// TODO needs implementation producer/consumer
	t.notificationMessage = msg
}

// Progress returns the current progress
func (t *WebProgress) Progress() float64 {
	if t.total == 0 {
		return 0
	}

	return t.current * 100 / t.total
}

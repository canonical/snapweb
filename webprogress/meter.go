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

const (
	// StatusInstalled indicates the package is in an installed state.
	StatusInstalled = "installed"
	// StatusUninstalled indicates the package is in an uninstalled state.
	StatusUninstalled = "uninstalled"
	// StatusInstalling indicates the package is in an installing state.
	StatusInstalling = "installing"
)

// WebProgress show progress on the terminal
type WebProgress struct {
	progress.Meter
	total               float64
	current             float64
	Status              string
	statusMessage       string
	notificationMessage string
	Error               error
	ErrorChan           chan error
}

// NewWebProgress returns a new WebProgress type
func NewWebProgress() *WebProgress {
	t := &WebProgress{
		ErrorChan: make(chan error),
		Status:    StatusInstalling,
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
func (t *WebProgress) Start(pkgName string, total float64) {
	t.total = total
	t.Status = StatusInstalling
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

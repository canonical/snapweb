package webprogress

import "launchpad.net/snappy/progress"

const (
	StatusInstalled   = "installed"
	StatusUninstalled = "uninstalled"
	StatusInstalling  = "installing"
	StatusError       = "error"
	StatusUnknown     = "unknown"
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
	return &WebProgress{
		ErrorChan: make(chan error),
		Status:    StatusUnknown,
	}
}

// Start starts showing progress
func (t *WebProgress) Start(total float64) {
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
	go func() {
		err := <-t.ErrorChan
		defer close(t.ErrorChan)

		if err != nil {
			t.Status = StatusError
			t.Error = err
		} else {
			t.Status = StatusInstalled
		}
	}()
}

// Done returns a boolean value indicating that the progress report
// has finished with no concerns if it was succesfull or not.
func (t *WebProgress) Done() bool {
	return t.Status == StatusInstalled || t.Status == StatusError
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

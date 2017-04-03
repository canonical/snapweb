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

package snappy

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"time"

	"log"

	"github.com/snapcore/snapweb/statetracker"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapd/snap"
)

const (
	installedSnaps = iota
	availableSnaps
	updatableSnaps
)

// SnapState wraps the current state of a snap
type SnapState struct {
	Status      string `json:"status"`
	TaskSummary string `json:"task_summary"`
	LocalSize   uint64 `json:"local_size,omitempty"`
}

type snapPkg struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Developer     string    `json:"developer"`
	Version       string    `json:"version"`
	Description   string    `json:"description"`
	Icon          string    `json:"icon"`
	State         SnapState `json:"state"`
	Price         string    `json:"price,omitempty"`
	Message       string    `json:"message,omitempty"`
	Progress      float64   `json:"progress,omitempty"`
	InstalledSize int64     `json:"installed_size,omitempty"`
	DownloadSize  int64     `json:"download_size,omitempty"`
	Type          snap.Type `json:"type,omitempty"`
	Private       bool      `json:"private"`
	Channel       string    `json:"channel"`
	InstallDate   string    `json:"install_date"`
}

type response struct {
	Package string `json:"package"`
	Message string `json:"message"`
}

func (h *Handler) getSnap(name string) (*client.Snap, error) {
	snap, _, err := h.snapdClient.Snap(name)
	if err == nil {
		return snap, nil
	}

	// Snap() now only returns installed snaps so search the store as a fallback
	snap, _, err = h.snapdClient.FindOne(name)
	if err != nil {
		return nil, err
	}

	if snap == nil {
		return nil, errors.New("snap could not be retrieved")
	}

	return snap, nil
}

func (h *Handler) packagePayload(name string) (snapPkg, error) {
	snap, err := h.getSnap(name)
	if err != nil {
		return snapPkg{}, err
	}

	return h.snapToPayload(snap), nil
}

func (h *Handler) allPackages(snapCondition int, query string, private bool, section string) ([]snapPkg, error) {
	var snaps []*client.Snap
	var err error

	if snapCondition == installedSnaps {
		snaps, err = h.snapdClient.List(nil, nil)
	} else if snapCondition == updatableSnaps {
		opts := &client.FindOptions{Refresh: true}
		snaps, _, err = h.snapdClient.Find(opts)
	} else {
		opts := &client.FindOptions{
			Query:   url.QueryEscape(query),
			Private: private,
			Section: section,
		}
		snaps, _, err = h.snapdClient.Find(opts)
	}

	if err != nil {
		return nil, err
	}

	snapPkgs := make([]snapPkg, 0, len(snaps))
	for _, snap := range snaps {
		snapPkgs = append(
			snapPkgs,
			h.snapToPayload(snap))
	}

	return snapPkgs, nil
}

func (h *Handler) removePackage(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}

	var changeID string

	changeID, err = h.snapdClient.Remove(name, nil)

	h.stateTracker.TrackUninstall(changeID, snap)

	return err
}

func (h *Handler) installPackage(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}

	var changeID string

	changeID, err = h.snapdClient.Install(name, nil)

	h.stateTracker.TrackInstall(changeID, snap)

	return err
}

func (h *Handler) abortRunningOperation(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}
	if snap == nil {
		return errors.New("Invalid snap name")
	}

	tracked, changeID := h.stateTracker.IsTrackedForRunningOperation(snap)
	if !tracked {
		return fmt.Errorf("No operation to abort for snap %s", name)
	}

	_, err = h.snapdClient.Abort(changeID)
	if err == nil {
		h.stateTracker.CancelTrackingFor(name)
	}

	return err
}

func (h *Handler) enable(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}
	if snap == nil {
		return fmt.Errorf("Snap not found %s", name)
	}

	if snap.Status != statetracker.StatusInstalled {
		return errors.New("Snap not installed and disabled")
	}

	var changeID string

	changeID, err = h.snapdClient.Enable(name, nil)
	if err == nil {
		h.stateTracker.TrackEnable(changeID, snap)
	}

	return err
}

func (h *Handler) disable(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}
	if snap == nil {
		return fmt.Errorf("Snap not found %s", name)
	}

	if snap.Status != statetracker.StatusActive {
		return errors.New("Snap not installed and enabled")
	}

	var changeID string

	changeID, err = h.snapdClient.Disable(name, nil)
	if err == nil {
		h.stateTracker.TrackDisable(changeID, snap)
	}

	return err
}

func (h *Handler) refresh(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}

	if snap == nil {
		return fmt.Errorf("Snap not found %s", name)
	}

	if snap.Status != statetracker.StatusActive {
		return errors.New("Snap not installed and enabled")
	}

	var changeID string

	changeID, err = h.snapdClient.Refresh(name)
	if err == nil {
		h.stateTracker.TrackRefresh(changeID, snap)
	}

	return err
}

// TODO:
func (h *Handler) refreshMany(names []string) error {
	_, err := h.snapdClient.RefreshMany(names)

	return err
}

func formatInstallData(d time.Time) string {
	// store snaps dont have install dates
	// are their install date are time.Time zero values
	if (d == time.Time{}) {
		// store snap
		return ""
	}
	return d.Format(time.UnixDate)
}

type snapPrices map[string]float64

func priceStringFromSnapPrice(p snapPrices) string {
	// picks up the "first" listed price for now
	var currencies []string
	for k := range p {
		currencies = append(currencies, k)
	}
	if len(currencies) == 0 {
		return ""
	}
	// TODO: "USD" might prevail? not sure
	sort.Strings(currencies)
	currency := currencies[0]
	return fmt.Sprintf("%s %s", strconv.FormatFloat(p[currency], 'f', -1, 32), currency)
}

func stateFromTrackerState(ts *statetracker.SnapState) SnapState {
	return SnapState{
		Status:      ts.Status,
		TaskSummary: ts.TaskSummary,
		LocalSize:   ts.LocalSize,
	}
}

func (h *Handler) snapToPayload(snapQ *client.Snap) snapPkg {

	snap := snapPkg{
		ID:          snapQ.Name,
		Name:        snapQ.Name,
		Developer:   snapQ.Developer,
		Version:     snapQ.Version,
		Description: snapQ.Description,
		Type:        snap.Type(snapQ.Type),
		State:       stateFromTrackerState(h.stateTracker.State(h.snapdClient, snapQ)),
		Price:       priceStringFromSnapPrice(snapQ.Prices),
		Private:     snapQ.Private,
		Channel:     snapQ.Channel,
		InstallDate: formatInstallData(snapQ.InstallDate),
	}

	isInstalled := snapQ.Status == client.StatusInstalled ||
		snapQ.Status == client.StatusActive

	if isInstalled {
		iconPath, err := localIconPath(h.snapdClient, snap.Name)
		if err != nil {
			if err == ErrIconNotExist {
				// We have an installed snap, but no icon found,
				// this could happen during an uninstall process.
				var p string
				p, err = tryLocateCachedIconForSnap(snap.Name)
				if err == nil {
					iconPath = p
				} else {
					iconPath = ""
				}
			} else {
				log.Println("Icon path for installed package cannot be set:", err)
				iconPath = ""
			}
		}

		snap.Icon = iconPath
		snap.InstalledSize = snapQ.InstalledSize
	} else {
		// quick fix for the icon problem (LP:#1668193)
		r := regexp.MustCompile("^/v2/icons/(.*)")
		match := r.Match([]byte(snapQ.Icon))
		if match {
			iconPath, err := localIconPath(h.snapdClient, snap.Name)
			if err != nil {
				iconPath = ""
			}
			snap.Icon = iconPath
		} else {
			snap.Icon = snapQ.Icon
		}
		snap.DownloadSize = snapQ.DownloadSize
	}

	return snap
}

/*
 * Copyright (C) 2014-2016 Canonical Ltd
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
	"sort"
	"strings"

	"log"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapd/snap"
)

const (
	installedSnaps = iota
	availableSnaps
)

type snapPkg struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Developer     string    `json:"developer"`
	Version       string    `json:"version"`
	Description   string    `json:"description"`
	Icon          string    `json:"icon"`
	Status        string    `json:"status"`
	Message       string    `json:"message,omitempty"`
	Progress      float64   `json:"progress,omitempty"`
	InstalledSize int64     `json:"installed_size,omitempty"`
	DownloadSize  int64     `json:"download_size,omitempty"`
	Type          snap.Type `json:"type,omitempty"`
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
	opts := &client.FindOptions{Query: name}
	snaps, _, err := h.snapdClient.Find(opts)
	if err != nil {
		return nil, err
	}

	snap = nil
	for _, s := range snaps {
		if strings.EqualFold(s.Name, name) {
			snap = s
			break
		}
	}

	if snap == nil {
		return nil, errors.New("snap could not be retrieved")
	}

	return snap, nil
}

func (h *Handler) packagePayload(resource string) (snapPkg, error) {
	snap, err := h.getSnap(resource)
	if err != nil {
		return snapPkg{}, err
	}

	return h.snapToPayload(snap), nil
}

func (h *Handler) allPackages(snapCondition int, query string) ([]snapPkg, error) {
	var snaps []*client.Snap
	var err error

	if snapCondition == installedSnaps {
		snaps, err = h.snapdClient.List(nil)
	} else {
		opts := &client.FindOptions{Query: query}
		snaps, _, err = h.snapdClient.Find(opts)
	}

	if err != nil {
		return nil, err
	}

	snapPkgs := make([]snapPkg, 0, len(snaps))
	for _, snap := range snaps {
		snapPkgs = append(snapPkgs, h.snapToPayload(snap))
	}

	sort.Sort(snapPkgsByName(snapPkgs))

	return snapPkgs, nil
}

func (h *Handler) removePackage(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}

	h.statusTracker.TrackUninstall(snap)

	_, err = h.snapdClient.Remove(name, nil)
	return err
}

func (h *Handler) installPackage(name string) error {
	snap, err := h.getSnap(name)
	if err != nil {
		return err
	}

	h.statusTracker.TrackInstall(snap)

	_, err = h.snapdClient.Install(name, nil)
	return err
}

func (h *Handler) snapToPayload(snapQ *client.Snap) snapPkg {
	snap := snapPkg{
		ID:          snapQ.Name,
		Name:        snapQ.Name,
		Developer:   snapQ.Developer,
		Version:     snapQ.Version,
		Description: snapQ.Description,
		Type:        snap.Type(snapQ.Type),
		Status:      h.statusTracker.Status(snapQ),
	}

	isInstalled := snapQ.Status == client.StatusInstalled || snapQ.Status == client.StatusActive

	if isInstalled {
		iconPath, err := localIconPath(h.snapdClient, snap.Name)
		if err != nil {
			log.Println("Icon path for installed package cannot be set", err)
			iconPath = ""
		}

		snap.Icon = iconPath
		snap.InstalledSize = snapQ.InstalledSize
	} else {
		snap.Icon = snapQ.Icon
		snap.DownloadSize = snapQ.DownloadSize
	}

	return snap
}

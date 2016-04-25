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
	"sort"
	"strconv"
	"strings"

	"log"

	"github.com/ubuntu-core/snappy/client"
	"github.com/ubuntu-core/snappy/snap"
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
	UIPort        uint64    `json:"ui_port,omitempty"`
}

type response struct {
	Package string `json:"package"`
	Message string `json:"message"`
}

func (h *Handler) packagePayload(resource string) (snapPkg, error) {
	snap, err := h.snapdClient.Snap(resource)
	if err != nil {
		return snapPkg{}, err
	}

	return h.snapToPayload(snap), nil
}

func (h *Handler) allPackages(filter client.SnapFilter) ([]snapPkg, error) {
	snaps, err := h.snapdClient.FilterSnaps(filter)
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

func (h *Handler) removePackage(ID string) error {
	snap, err := h.snapdClient.Snap(ID)
	if err != nil {
		return err
	}

	h.statusTracker.TrackUninstall(snap)

	_, err = h.snapdClient.RemoveSnap(ID)
	return err
}

func (h *Handler) installPackage(ID string) error {
	snap, err := h.snapdClient.Snap(ID)
	if err != nil {
		return err
	}

	h.statusTracker.TrackInstall(snap)

	_, err = h.snapdClient.AddSnap(ID)
	return err
}

func hasPortInformation(snapQ *client.Snap) bool {
	snapType := snap.Type(snapQ.Type)
	return snapType == snap.TypeApp || snapType == snap.TypeFramework
}

func (h *Handler) snapToPayload(snapQ *client.Snap) snapPkg {
	snap := snapPkg{
		ID:          snapQ.Name + "." + snapQ.Developer,
		Name:        snapQ.Name,
		Developer:   snapQ.Developer,
		Version:     snapQ.Version,
		Description: snapQ.Description,
		Type:        snap.Type(snapQ.Type),
		Status:      h.statusTracker.Status(snapQ),
	}

	if hasPortInformation(snapQ) {
		if services, err := h.snapdClient.Services(snap.ID); err == nil {
			snap.UIPort = uiAccess(services)
		}
	}

	isInstalled := snapQ.Status == client.StatusInstalled || snapQ.Status == client.StatusActive

	if isInstalled {
		iconPath, err := localIconPath(h.snapdClient, snap.ID)
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

func uiAccess(services map[string]*client.Service) uint64 {
	for i := range services {
		if services[i].Spec.Ports.External == nil {
			continue
		}

		if ui, ok := services[i].Spec.Ports.External["ui"]; ok {
			ui := strings.Split(ui.Port, "/")
			if len(ui) == 2 {
				port, err := strconv.ParseUint(ui[0], 0, 64)
				if err != nil {
					return 0
				}

				return port
			}
		}
	}

	return 0
}

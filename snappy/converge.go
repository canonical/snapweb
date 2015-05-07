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

package snappy

import (
	"sort"
	"strconv"
	"strings"

	"log"

	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/webprogress"
)

type snapPkg struct {
	ID            string             `json:"id"`
	Name          string             `json:"name"`
	Origin        string             `json:"origin"`
	Version       string             `json:"version"`
	Vendor        string             `json:"vendor"`
	Description   string             `json:"description"`
	Icon          string             `json:"icon"`
	Status        webprogress.Status `json:"status"`
	Message       string             `json:"message,omitempty"`
	IsError       bool               `json:"-"`
	Progress      float64            `json:"progress,omitempty"`
	InstalledSize int64              `json:"installed_size,omitempty"`
	DownloadSize  int64              `json:"download_size,omitempty"`
	Type          snappy.SnapType    `json:"type,omitempty"`
	UIPort        uint64             `json:"ui_port,omitempty"`
	UIUri         string             `json:"ui_uri,omitempty"`
}

type response struct {
	Package string `json:"package"`
	Message string `json:"message"`
}

type listFilter struct {
	Types         []string
	InstalledOnly bool
}

// for easier stubbing during testing
var activeSnapByName = snappy.ActiveSnapByName

func (h *Handler) packagePayload(resource string) (snapPkg, error) {
	var pkgName, namespace string
	if s := strings.Split(resource, "."); len(s) == 2 {
		pkgName = s[0]
		namespace = s[1]
	} else {
		pkgName = resource
	}

	snapQ := activeSnapByName(pkgName)
	if snapQ != nil {
		// the second check is for locally installed snaps that lose their origin.
		if snapQ.Namespace() == namespace || snapQ.Type() != snappy.SnapTypeApp {
			return h.snapQueryToPayload(snapQ), nil
		}
	}

	mStore := snappy.NewMetaStoreRepository()
	found, err := mStore.Details(resource)
	if err == nil && len(found) != 0 {
		return h.snapQueryToPayload(found[0]), nil
	}

	return snapPkg{}, snappy.ErrPackageNotFound
}

func (h *Handler) allPackages(installedOnly bool) ([]snapPkg, error) {
	mLocal := snappy.NewMetaLocalRepository()

	installedSnaps, err := mLocal.Installed()
	if err != nil {
		return nil, err
	}

	installedSnapQs := make([]snapPkg, 0, len(installedSnaps))
	for i := range installedSnaps {
		installedSnapQs = append(installedSnapQs, h.snapQueryToPayload(installedSnaps[i]))
	}

	mStore := snappy.NewUbuntuStoreSnapRepository()
	remoteSnaps, err := mStore.Search("*")
	if err != nil {
		return nil, err
	}

	remoteSnapQs := make([]snapPkg, 0, len(remoteSnaps))

	for _, remote := range remoteSnaps {
		if alias := remote.Alias; alias != nil {
			remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(alias))
		} else {
			for _, part := range remote.Parts {
				remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(part))
			}
		}
	}

	return mergeSnaps(installedSnapQs, remoteSnapQs, installedOnly), nil
}

func (h *Handler) doRemovePackage(progress *webprogress.WebProgress, ID string) {
	pkgName := strings.Split(ID, ".")[0]

	err := snappy.Remove(pkgName, 0, progress)
	progress.ErrorChan <- err
	close(progress.ErrorChan)
}

func (h *Handler) removePackage(ID string) error {
	progress, err := h.statusTracker.Add(ID, webprogress.OperationRemove)
	if err != nil {
		return err
	}

	go h.doRemovePackage(progress, ID)

	return nil
}

func (h *Handler) doInstallPackage(progress *webprogress.WebProgress, ID string) {
	_, err := snappy.Install(ID, 0, progress)
	progress.ErrorChan <- err
	close(progress.ErrorChan)
}

func (h *Handler) installPackage(ID string) error {
	progress, err := h.statusTracker.Add(ID, webprogress.OperationInstall)
	if err != nil {
		return err
	}

	go h.doInstallPackage(progress, ID)

	return nil
}

func mergeSnaps(installed, remote []snapPkg, installedOnly bool) []snapPkg {
	remoteMap := make(map[string]*snapPkg, len(remote))

	// we start with the installed set
	allMap := make(map[string]*snapPkg, len(installed))

	for i := range remote {
		remoteMap[remote[i].Name] = &remote[i]
	}

	for i := range installed {
		allMap[installed[i].Name] = &installed[i]
	}

	for pkgName := range remoteMap {
		if _, ok := allMap[pkgName]; ok {
			// TODO add details about cost and pricing, and then delete
		} else if !installedOnly {
			allMap[pkgName] = remoteMap[pkgName]
		}
	}

	snapPkgs := make([]snapPkg, 0, len(allMap))

	for _, v := range allMap {
		snapPkgs = append(snapPkgs, *v)
	}

	sort.Sort(snapPkgsByName(snapPkgs))

	return snapPkgs
}

func isNamespaceless(snap snappy.Part) bool {
	return snap.Type() == snappy.SnapTypeOem || snap.Type() == snappy.SnapTypeFramework
}

func hasPortInformation(snap snappy.Part) bool {
	return snap.Type() == snappy.SnapTypeApp || snap.Type() == snappy.SnapTypeFramework
}

func (h *Handler) snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		Name:        snapQ.Name(),
		Origin:      snapQ.Namespace(),
		Version:     snapQ.Version(),
		Vendor:      snapQ.Vendor(),
		Description: snapQ.Description(),
		Type:        snapQ.Type(),
	}

	if isNamespaceless(snapQ) {
		snap.ID = snapQ.Name()
	} else {
		snap.ID = snapQ.Name() + "." + snapQ.Namespace()
	}

	if hasPortInformation(snapQ) {
		if snapInstalled, ok := snapQ.(snappy.Services); ok {
			port, uri := uiAccess(snapInstalled.Services())
			snap.UIPort = port
			snap.UIUri = uri
		}
	}

	if snapQ.IsInstalled() {
		iconPath, err := localIconPath(snap.ID, snapQ.Icon())
		if err != nil {
			log.Println("Icon path for installed package cannot be set", err)
			iconPath = ""
		}

		snap.Icon = iconPath
		snap.InstalledSize = snapQ.InstalledSize()
	} else {
		snap.Icon = snapQ.Icon()
		snap.DownloadSize = snapQ.DownloadSize()
	}

	if stat, ok := h.statusTracker.Get(snap.ID); ok {
		snap.Status = stat.Status
		if stat.Done() {
			defer h.statusTracker.Remove(snap.ID)

			if stat.Error != nil {
				snap.Message = stat.Error.Error()
				snap.IsError = true
			}

		} else {
			snap.Progress = stat.Progress()
		}
	} else if snapQ.IsInstalled() {
		snap.Status = webprogress.StatusInstalled
	} else {
		snap.Status = webprogress.StatusUninstalled
	}

	return snap
}

func uiAccess(services []snappy.Service) (port uint64, uri string) {
	for i := range services {
		if services[i].Ports == nil {
			continue
		}

		if ui, ok := services[i].Ports.External["ui"]; ok {
			ui := strings.Split(ui.Port, "/")
			if len(ui) == 2 {
				port, err := strconv.ParseUint(ui[0], 0, 64)
				if err != nil {
					return 0, ""
				}

				// FIXME ui[1] holds the proto, not the uri handler
				return port, ""
			}
		}
	}

	return 0, ""
}

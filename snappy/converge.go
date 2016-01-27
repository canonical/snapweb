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
	"regexp"
	"sort"
	"strconv"
	"strings"

	"log"

	"github.com/ubuntu-core/snappy/client"
	"github.com/ubuntu-core/snappy/snap"
	"github.com/ubuntu-core/snappy/snappy"
	"launchpad.net/webdm/webprogress"
)

type snapPkg struct {
	ID            string             `json:"id"`
	Name          string             `json:"name"`
	Origin        string             `json:"origin"`
	Version       string             `json:"version"`
	Description   string             `json:"description"`
	Icon          string             `json:"icon"`
	Status        webprogress.Status `json:"status"`
	Message       string             `json:"message,omitempty"`
	IsError       bool               `json:"-"`
	Progress      float64            `json:"progress,omitempty"`
	InstalledSize int64              `json:"installed_size,omitempty"`
	DownloadSize  int64              `json:"download_size,omitempty"`
	Type          snap.Type          `json:"type,omitempty"`
	UIPort        uint64             `json:"ui_port,omitempty"`
}

type response struct {
	Package string `json:"package"`
	Message string `json:"message"`
}

type listFilter struct {
	types         []string
	installedOnly bool
	query         string
}

func (h *Handler) packagePayload(resource string) (snapPkg, error) {
	pkg, err := h.snapdClient.Package(resource)
	if err != nil {
		return snapPkg{}, err
	}

	return h.snapQueryToPayload(packagePart{*pkg}), nil
}

func (h *Handler) allPackages(filter *listFilter) ([]snapPkg, error) {
	mLocal := snappy.NewMetaLocalRepository()

	installedSnaps, err := mLocal.Installed()
	if err != nil {
		return nil, err
	}

	typeFilter := func(string) bool { return true }

	if len(filter.types) != 0 {
		regex, err := regexp.Compile("^(?:" + strings.Join(filter.types, "|") + ")")
		if err != nil {
			return nil, err
		}
		typeFilter = regex.MatchString
	}

	queryFilter := func(string) bool { return true }

	if filter.query != "" {
		regex, err := regexp.Compile("^(?:" + filter.query + ")")
		if err != nil {
			return nil, err
		}
		queryFilter = regex.MatchString
	}

	installedSnapQs := make([]snapPkg, 0, len(installedSnaps))
	for i := range installedSnaps {
		if !typeFilter(string(installedSnaps[i].Type())) {
			continue
		}

		if !queryFilter(installedSnaps[i].Name()) {
			continue
		}

		installedSnapQs = append(installedSnapQs, h.snapQueryToPayload(installedSnaps[i]))
	}

	mStore := snappy.NewUbuntuStoreSnapRepository()
	remoteSnaps, err := mStore.Search(filter.query)
	if err != nil {
		return nil, err
	}

	remoteSnapQs := make([]snapPkg, 0, len(remoteSnaps))

	for _, remote := range remoteSnaps {
		if alias := remote.Alias; alias != nil {
			if !typeFilter(string(alias.Type())) {
				continue
			}
			remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(alias))
		} else {
			for _, part := range remote.Parts {
				if !typeFilter(string(part.Type())) {
					continue
				}
				remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(part))
			}
		}
	}

	return mergeSnaps(installedSnapQs, remoteSnapQs, filter.installedOnly), nil
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

func hasPortInformation(snapQ snappy.Part) bool {
	return snapQ.Type() == snap.TypeApp || snapQ.Type() == snap.TypeFramework
}

func (h *Handler) snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		ID:          snapQ.Name() + "." + snapQ.Origin(),
		Name:        snapQ.Name(),
		Origin:      snapQ.Origin(),
		Version:     snapQ.Version(),
		Description: snapQ.Description(),
		Type:        snapQ.Type(),
	}

	if hasPortInformation(snapQ) {
		if services, err := h.snapdClient.Services(snap.ID); err == nil {
			snap.UIPort = uiAccess(services)
		}
	}

	if snapQ.IsInstalled() {
		iconPath, err := localIconPath(h.snapdClient, snap.ID)
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

package snappy

import (
	"strconv"
	"strings"

	"log"

	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/progress"
)

type snapPkg struct {
	Name     string          `json:"name"`
	Origin   string          `json:"origin"`
	Version  string          `json:"version"`
	Icon     string          `json:"icon"`
	Status   string          `json:"status"`
	Message  string          `json:"message,omitempty"`
	Progress float64         `json:"progress,omitempty"`
	Type     snappy.SnapType `json:"type,omitempty"`
	UIPort   uint64          `json:"ui_port,omitempty"`
	UIUri    string          `json:"ui_uri,omitempty"`
}

type Response struct {
	Package string `json:"package"`
	Message string `json:"message"`
}

// for easier stubbing during testing
var activeSnapByName = snappy.ActiveSnapByName

func (h *handler) packagePayload(pkgName string) (snapPkg, error) {
	snapQ := activeSnapByName(pkgName)
	if snapQ != nil {
		return h.snapQueryToPayload(snapQ), nil
	}

	mStore := snappy.NewMetaStoreRepository()
	found, err := mStore.Details(pkgName)
	if err == nil && len(found) != 0 {
		return h.snapQueryToPayload(found[0]), nil
	}

	return snapPkg{}, snappy.ErrPackageNotFound
}

func (h *handler) allPackages() ([]snapPkg, error) {
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
			/*
				TODO reenable once we can filter by type
				for _, part := range remote.Parts {
					remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(part))
				}
			*/
		}
	}

	return mergeSnaps(installedSnapQs, remoteSnapQs), nil
}

func (h *handler) doInstallPackage(progress *webprogress.WebProgress, pkgName string) {
	_, err := snappy.Install(pkgName, 0, progress)
	progress.ErrorChan <- err
}

func (h *handler) installPackage(pkgName string) error {
	progress, err := h.installStatus.Add(pkgName)
	if err != nil {
		return err
	}

	go h.doInstallPackage(progress, pkgName)

	return nil
}

func mergeSnaps(installed, remote []snapPkg) []snapPkg {
	remoteMap := make(map[string]snapPkg)

	for i := range remote {
		remoteMap[remote[i].Name] = remote[i]
	}

	for _, pkg := range installed {
		// TODO add details about cost and pricing, and then delete
		delete(remoteMap, pkg.Name)
	}

	snapPkgs := installed

	for _, v := range remoteMap {
		snapPkgs = append(snapPkgs, v)
	}

	return snapPkgs
}

func hasPortInformation(snap snappy.Part) bool {
	return snap.Type() == snappy.SnapTypeApp || snap.Type() == snappy.SnapTypeFramework
}

func (h *handler) snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		Name:    snapQ.Name(),
		Origin:  snapQ.Namespace(),
		Version: snapQ.Version(),
		Type:    snapQ.Type(),
	}

	if hasPortInformation(snapQ) {
		if snapInstalled, ok := snapQ.(snappy.Services); ok {
			port, uri := uiAccess(snapInstalled.Services())
			snap.UIPort = port
			snap.UIUri = uri
		}
	}

	if snapQ.IsInstalled() {
		iconPath, err := localIconPath(snapQ.Name(), snapQ.Icon())
		if err != nil {
			log.Println("Icon path for installed package cannot be set", err)
			iconPath = ""
		}

		snap.Icon = iconPath
	} else {
		snap.Icon = snapQ.Icon()
	}

	if stat, ok := h.installStatus.Get(snap.Name); ok {
		snap.Status = stat.Status
		if stat.Done() {
			if stat.Error != nil {
				snap.Message = stat.Error.Error()
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

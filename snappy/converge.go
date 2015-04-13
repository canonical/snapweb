package snappy

import (
	"strconv"
	"strings"

	"log"

	"launchpad.net/snappy/snappy"
)

const (
	statusInstalled   = "installed"
	statusUninstalled = "uninstalled"
	statusInstalling  = "installing"
	statusUnkown      = "unknown"
)

type snapPkg struct {
	Name     string          `json:"name"`
	Version  string          `json:"version"`
	Icon     string          `json:"icon"`
	Status   string          `json:"status"`
	Progress float64         `json:"progress,omitempty"`
	Type     snappy.SnapType `json:"type,omitempty"`
	UIPort   uint64          `json:"ui_port,omitempty"`
	UIUri    string          `json:"ui_uri,omitempty"`
}

// for easier stubbing during testing
var activeSnapByName = snappy.ActiveSnapByName

func (h *handler) packagePayload(pkgName string) (snapPkg, error) {
	snapQ := activeSnapByName(pkgName)
	if snapQ == nil {
		return snapPkg{}, snappy.ErrPackageNotFound
	}

	return h.snapQueryToPayload(snapQ), nil
}

func (h *handler) allPackages() ([]snapPkg, error) {
	m := snappy.NewMetaRepository()

	installedSnaps, err := m.Installed()
	if err != nil {
		return nil, err
	}

	installedSnapQs := make([]snapPkg, 0, len(installedSnaps))
	for i := range installedSnaps {
		installedSnapQs = append(installedSnapQs, h.snapQueryToPayload(installedSnaps[i]))
	}

	remoteSnaps, err := m.Search("*")
	if err != nil {
		return nil, err
	}

	remoteSnapQs := make([]snapPkg, 0, len(remoteSnaps))
	for i := range remoteSnaps {
		remoteSnapQs = append(remoteSnapQs, h.snapQueryToPayload(remoteSnaps[i]))
	}

	return mergeSnaps(installedSnapQs, remoteSnapQs), nil
}

func (h *handler) installPackage(pkgName string) error {
	progress, err := h.installStatus.Add(pkgName)
	if err != nil {
		return err
	}

	errChan := make(chan error)

	go func() {
		_, err := snappy.Install(pkgName, 0, progress)
		errChan <- err
		defer close(errChan)

		<-progress.FinishedChan
		h.installStatus.Remove(pkgName)
	}()

	select {
	case err := <-errChan:
		return err
	case <-progress.StartedChan:
		return nil
	}
}

func mergeSnaps(installed, remote []snapPkg) []snapPkg {
	remoteMap := make(map[string]snapPkg, len(remote))

	for i := range remote {
		remoteMap[remote[i].Name] = remote[i]
	}

	for i := range installed {
		pkgName := installed[i].Name
		if _, ok := remoteMap[pkgName]; ok {
			// TODO add details about cost and pricing, and then delete
			delete(remoteMap, pkgName)
		}
	}

	snapPkgs := installed
	for _, v := range remote {
		snapPkgs = append(snapPkgs, v)
	}

	return snapPkgs
}

func (h *handler) snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		Name:    snapQ.Name(),
		Version: snapQ.Version(),
		Type:    snapQ.Type(),
	}

	if snap.Type == snappy.SnapTypeApp || snap.Type == snappy.SnapTypeFramework {
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
		snap.Status = statusInstalling
		snap.Progress = stat.Progress()
	} else if snapQ.IsInstalled() {
		snap.Status = statusInstalled
	} else {
		snap.Status = statusUninstalled
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

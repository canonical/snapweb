package snappy

import (
	"errors"
	"strconv"
	"strings"

	"launchpad.net/snappy/snappy"
)

var (
	errPackageNotFound = errors.New("package not found")
)

type snapPkg struct {
	Name      string          `json:"name"`
	Version   string          `json:"version"`
	Installed bool            `json:"installed"`
	Type      snappy.SnapType `json:"type"`
	UIPort    uint64          `json:"ui_port,omitempty"`
	UIUri     string          `json:"ui_uri,omitempty"`
}

// for easier stubbing during testing
var activeSnapByName = snappy.ActiveSnapByName

func packagePayload(pkgName string) (snapPkg, error) {
	snapQ := activeSnapByName(pkgName)
	if snapQ == nil {
		return snapPkg{}, errPackageNotFound
	}

	return snapQueryToPayload(snapQ), nil
}

func allPackages() ([]snapPkg, error) {
	m := snappy.NewMetaRepository()

	installedSnaps, err := m.Installed()
	if err != nil {
		return nil, err
	}

	installedSnapQs := make([]snapPkg, 0, len(installedSnaps))
	for i := range installedSnaps {
		installedSnapQs = append(installedSnapQs, snapQueryToPayload(installedSnaps[i]))
	}

	remoteSnaps, err := m.Search("*")
	if err != nil {
		return nil, err
	}

	remoteSnapQs := make([]snapPkg, 0, len(remoteSnaps))
	for i := range remoteSnaps {
		remoteSnapQs = append(remoteSnapQs, snapQueryToPayload(remoteSnaps[i]))
	}

	return mergeSnaps(installedSnapQs, remoteSnapQs), nil
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

func snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		Name:      snapQ.Name(),
		Version:   snapQ.Version(),
		Installed: snapQ.IsInstalled(),
		Type:      snapQ.Type(),
	}

	if snap.Type == snappy.SnapTypeApp || snap.Type == snappy.SnapTypeFramework {
		if snapInstalled, ok := snapQ.(snappy.Services); ok {
			port, uri := uiAccess(snapInstalled.Services())
			snap.UIPort = port
			snap.UIUri = uri
		}
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

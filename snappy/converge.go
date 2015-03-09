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

func packagePayload(pkgName string) (snapPkg, error) {
	snapQ := snappy.ActiveSnapByName(pkgName)
	if snapQ == nil {
		return snapPkg{}, errPackageNotFound
	}

	return snapQueryToPayload(snapQ), nil
}

func snapQueryToPayload(snapQ snappy.Part) snapPkg {
	snap := snapPkg{
		Name:      snapQ.Name(),
		Version:   snapQ.Version(),
		Installed: snapQ.IsInstalled(),
		Type:      snapQ.Type(),
	}

	if snap.Type == snappy.SnapTypeApp || snap.Type == snappy.SnapTypeFramework {
		if snapInstalled, ok := snapQ.(*snappy.SnapPart); ok {
			port, uri := uiAccess(snapInstalled.Services())
			snap.UIPort = port
			snap.UIUri = uri
		}
	}

	return snap
}

func uiAccess(services []snappy.Service) (port uint64, uri string) {
	for i := range services {
		if ui, ok := services[i].Ports.External["ui"]; ok {
			ui := strings.Split(ui.Port, "/")
			if len(ui) == 2 {
				port, err := strconv.ParseUint(ui[0], 0, 64)
				if err != nil {
					return 0, ""
				}

				return port, ui[1]
			}
		}
	}

	return 0, ""
}

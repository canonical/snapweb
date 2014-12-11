/*
 * Copyright 2014 Canonical Ltd.
 *
 * Authors:
 * Michael Frey: michael.frey@canonical.com
 *
 * This file is part of snappy.
 *
 * usensord is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3.
 *
 * usensord is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package system

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"launchpad.net/go-dbus/v1"
)

var (
	conn     *dbus.Connection
	logger   *log.Logger
	update   UpdateStatus
	progress UpdateProgress
)

type System struct {
	conn             *dbus.Connection
	Info             map[string]string
	update           *UpdateStatus
	progress         *UpdateProgress
	updateDownloaded bool
	rebooting        bool
}

type UpdateStatus struct {
	isAvail      bool
	downloading  bool
	availVersion string
	updateSize   int32
	lastUpdate   string
	errorReason  string
}

type UpdateProgress struct {
	percentage int32
	eta        float64
}

func New(conn *dbus.Connection) (*System, error) {
	obj := conn.Object("com.canonical.SystemImage", "/Service")

	reply, err := obj.Call("com.canonical.SystemImage", "Information")
	if err != nil {
		logger.Println("Error getting System Image Info %s", err)
		return nil, err
	} else if reply.Type == dbus.TypeError {
		return nil, reply.AsError()
	}

	information := make(map[string]string)

	if err := reply.Args(&information); err != nil {
		return nil, err
	}

	systemInfo := System{conn: conn, Info: information, update: &update, progress: &progress}

	return &systemInfo, nil

}

func (systemInfo *System) Init() {

	updateAvailStatus, _ := systemInfo.conn.WatchSignal(&dbus.MatchRule{
		Type:      dbus.TypeSignal,
		Path:      "/Service",
		Interface: "com.canonical.SystemImage",
		Member:    "UpdateAvailableStatus"})

	updateProgress, _ := systemInfo.conn.WatchSignal(&dbus.MatchRule{
		Type:      dbus.TypeSignal,
		Path:      "/Service",
		Interface: "com.canonical.SystemImage",
		Member:    "UpdateProgress"})

	updateDownloaded, _ := systemInfo.conn.WatchSignal(&dbus.MatchRule{
		Type:      dbus.TypeSignal,
		Path:      "/Service",
		Interface: "com.canonical.SystemImage",
		Member:    "UpdateDownloaded"})

	rebooting, _ := systemInfo.conn.WatchSignal(&dbus.MatchRule{
		Type:      dbus.TypeSignal,
		Path:      "/Service",
		Interface: "com.canonical.SystemImage",
		Member:    "Rebooting"})

	go func() {
		for {
			select {
			case a := <-updateAvailStatus.C:
				if err := a.Args(&systemInfo.update.isAvail, &systemInfo.update.downloading,
					&systemInfo.update.availVersion, &systemInfo.update.updateSize,
					&systemInfo.update.lastUpdate, &systemInfo.update.errorReason); err != nil {
					log.Println("Error getting update status ", err)
				}
				if systemInfo.update.isAvail {
					log.Println("Update Avail: ", systemInfo.update.availVersion)
				}
			case b := <-updateProgress.C:
				if err := b.Args(&systemInfo.progress.percentage, &systemInfo.progress.eta); err != nil {
					log.Println("Error getting update progress")
				}
			case <-updateDownloaded.C:
				systemInfo.updateDownloaded = true
			case c := <-rebooting.C:
				if err := c.Args(&systemInfo.rebooting); err != nil {
					log.Println("Error getting update progress")
				}
				log.Println("Rebooting status ", systemInfo.rebooting)
			}
		}
		close(updateAvailStatus.C)
		close(updateProgress.C)
		close(updateDownloaded.C)
	}()
}

func (systemInfo *System) MakeMuxer(prefix string) http.Handler {
	var m *mux.Router

	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/checkForUpdate", systemInfo.checkForUpdate).Methods("GET")

	m.HandleFunc("/downloadUpdate", systemInfo.downloadUpdate).Methods("GET")

	m.HandleFunc("/", systemInfo.applyUpdate).Methods("POST")

	m.HandleFunc("/", systemInfo.getSystemInfo).Methods("GET")

	return m

}

func (systemInfo *System) getSystemInfo(w http.ResponseWriter, r *http.Request) {

	obj := systemInfo.conn.Object("com.canonical.SystemImage", "/Service")

	reply, err := obj.Call("com.canonical.SystemImage", "Information")
	if err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	} else if reply.Type == dbus.TypeError {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", reply.AsError()))
	}

	information := make(map[string]string)

	if err := reply.Args(&information); err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(information); err != nil {
		fmt.Fprint(w, "Error")
	}
}

func (systemInfo *System) checkForUpdate(w http.ResponseWriter, r *http.Request) {

	obj := systemInfo.conn.Object("com.canonical.SystemImage", "/Service")
	reply, err := obj.Call("com.canonical.SystemImage", "CheckForUpdate")

	if err != nil || reply.Type == dbus.TypeError {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	}

	fmt.Fprint(w, "Checking for System Update...")

}

func (systemInfo *System) downloadUpdate(w http.ResponseWriter, r *http.Request) {

	obj := systemInfo.conn.Object("com.canonical.SystemImage", "/Service")
	reply, err := obj.Call("com.canonical.SystemImage", "DownloadUpdate")

	if err != nil || reply.Type == dbus.TypeError {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	}

	fmt.Fprint(w, "Downloading System Update...")

}

func (systemInfo *System) applyUpdate(w http.ResponseWriter, r *http.Request) {

	if systemInfo.update.isAvail {
		log.Println("In Apply Update ", systemInfo.update)

		obj := systemInfo.conn.Object("com.canonical.SystemImage", "/Service")
		reply, err := obj.Call("com.canonical.SystemImage", "ApplyUpdate")

		if err != nil {
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		} else if reply.Type == dbus.TypeError {
			fmt.Fprint(w, fmt.Sprintf("Error: %s", reply.AsError()))
		}
	}

}

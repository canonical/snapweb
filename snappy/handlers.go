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
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/webprogress"

	"github.com/gorilla/mux"
)

// Handler implements snappy's packages api.
type Handler struct {
	installStatus *webprogress.Status
}

// NewHandler creates an instance that implements snappy's packages api.
func NewHandler() *Handler {
	return &Handler{
		installStatus: webprogress.New(),
	}
}

func (h *Handler) getAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	dec := json.NewDecoder(r.Body)

	var filter listFilter
	if err := dec.Decode(&filter); err != nil && err != io.EOF {
		w.WriteHeader(http.StatusInternalServerError)
		enc.Encode(fmt.Sprintf("Error: %s", err))
		return
	}

	payload, err := h.allPackages(filter.InstalledOnly)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		enc.Encode(fmt.Sprintf("Error: %s", err))
		return
	}

	if err := enc.Encode(payload); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		// give up on json
		fmt.Fprintf(w, "Error: %s", err)
		log.Print(err)
	}
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]
	enc := json.NewEncoder(w)

	payload, err := h.packagePayload(pkgName)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		//		http.NotFound(w, r)
		enc.Encode(fmt.Sprintln(err, pkgName))
		return
	}

	if err := enc.Encode(payload); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		// give up on json
		fmt.Fprintf(w, "Error: %s", err)
		log.Print(err)
	}
}

func (h *Handler) add(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	var msg string
	var status int

	err := h.installPackage(pkgName)

	switch err {
	case snappy.ErrAlreadyInstalled:
		status = http.StatusOK
		msg = "Installed"
	case webprogress.ErrPackageInstallInProgress:
		status = http.StatusBadRequest
		msg = "Installation in progress"
	case snappy.ErrPackageNotFound:
		status = http.StatusNotFound
		msg = "Package not found"
	case nil:
		status = http.StatusAccepted
		msg = "Accepted"
	default:
		status = http.StatusInternalServerError
		msg = "Processing error"
	}

	response := response{Message: msg, Package: pkgName}
	bs, err := json.Marshal(response)
	if err != nil {
		// giving up on json
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error: %s", err)
		log.Print(err)
		return
	}

	w.WriteHeader(status)
	w.Write(bs)
}

// MakeMuxer sets up the handlers multiplexing to handle requests against snappy's
// packages api
func (h *Handler) MakeMuxer(prefix string) http.Handler {
	var m *mux.Router

	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	// Get all of packages.
	m.HandleFunc("/", h.getAll).Methods("GET")

	// get specific package
	m.HandleFunc("/{pkg}", h.get).Methods("GET")

	// Add a package
	m.HandleFunc("/{pkg}", h.add).Methods("PUT")

	return m
}

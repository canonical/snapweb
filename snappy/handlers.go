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
	"net/http"

	"log"

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
	dec := json.NewDecoder(r.Body)

	var filter listFilter
	if err := dec.Decode(&filter); err != nil && err != io.EOF {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	payload, err := h.allPackages(filter.InstalledOnly)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(payload); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	payload, err := h.packagePayload(pkgName)
	if err != nil {
		http.NotFound(w, r)
		fmt.Fprintln(w, err, pkgName)
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(payload); err != nil {
		fmt.Fprint(w, "Error")
	}
}

func (h *Handler) add(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	enc := json.NewEncoder(w)
	var msg string

	err := h.installPackage(pkgName)

	switch err {
	case snappy.ErrAlreadyInstalled:
		w.WriteHeader(http.StatusOK)
		msg = "Installed"
	case webprogress.ErrPackageInstallInProgress:
		w.WriteHeader(http.StatusBadRequest)
		msg = "Installation in progress"
	case snappy.ErrPackageNotFound:
		w.WriteHeader(http.StatusNotFound)
		msg = "Package not found"
	case nil:
		w.WriteHeader(http.StatusAccepted)
		msg = "Accepted"
	default:
		w.WriteHeader(http.StatusInternalServerError)
		msg = "Processing error"
	}

	response := response{Message: msg, Package: pkgName}
	if err := enc.Encode(response); err != nil {
		log.Print(err)
	}
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

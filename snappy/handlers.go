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
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapweb/statustracker"

	"github.com/gorilla/mux"
)

// Handler implements snappy's packages api.
type Handler struct {
	statusTracker *statustracker.StatusTracker
	snapdClient   SnapdClient
}

// NewHandler creates an instance that implements snappy's packages api.
func NewHandler() *Handler {
	return &Handler{
		statusTracker: statustracker.New(),
		snapdClient:   client.New(nil),
	}
}

func (h *Handler) setClient(c SnapdClient) {
	h.snapdClient = c
}

func (h *Handler) jsonResponseOrError(v interface{}, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)

	if err := enc.Encode(v); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error: %s", err)
		log.Print(err)
	}
}

func (h *Handler) snapOperationResponse(name string, err error, w http.ResponseWriter) {
	msg := "Accepted"
	status := http.StatusAccepted

	if err != nil {
		msg = "Processing error"
		status = http.StatusInternalServerError
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	h.jsonResponseOrError(response{Message: msg, Package: name}, w)
}

func (h *Handler) getAll(w http.ResponseWriter, r *http.Request) {
	snapCondition := availableSnaps
	if r.FormValue("installed_only") == "true" {
		snapCondition = installedSnaps
	}
	query := r.FormValue("q")

	payload, err := h.allPackages(snapCondition, query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error: %s", err)
		return
	}

	h.jsonResponseOrError(payload, w)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]

	payload, err := h.packagePayload(name)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintln(w, err, name)
		return
	}

	h.jsonResponseOrError(payload, w)
}

func (h *Handler) add(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]

	err := h.installPackage(name)

	h.snapOperationResponse(name, err, w)
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]

	err := h.removePackage(name)

	h.snapOperationResponse(name, err, w)
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
	m.HandleFunc("/{name}", h.get).Methods("GET")

	// Add a package
	m.HandleFunc("/{name}", h.add).Methods("PUT")

	// Remove a package
	m.HandleFunc("/{name}", h.remove).Methods("DELETE")

	return m
}

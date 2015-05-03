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

package oem

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	data, err := Oem()
	if err != nil {
		if err == ErrNotFound {
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprint(w, "No OEM package installed")
		} else if err == ErrTooMany {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		} else if err == ErrDecode {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		}
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
}

func (h *handler) MakeMuxer(prefix string) http.Handler {
	var m *mux.Router

	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	// Get oem branding.
	m.HandleFunc("/", h.get).Methods("GET")

	return m
}

func glob(dir string, filename string) (pkgs []string, err error) {
	err = filepath.Walk(dir, func(path string, f os.FileInfo, err error) error {
		if filepath.Base(path) == filename {
			pkgs = append(pkgs, path)
		}

		return nil
	})

	return pkgs, err
}

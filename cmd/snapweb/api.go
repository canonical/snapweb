/*
 * Copyright (C) 2014-2017 Canonical Ltd
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

package main

import (
	"net/http"
	"path"
	"strings"

	"github.com/gorilla/mux"

	"github.com/snapcore/snapweb/snappy/app"
)

const apiVersion = "v2"

// makeAPIHandler create a handler for all API calls that need authorization
func makeAPIHandler(apiRootPath string) http.Handler {
	var apiPath = path.Join(apiRootPath, apiVersion)

	router := mux.NewRouter().PathPrefix(apiPath).Subrouter()
	router.Handle("/packages/", snappy.NewHandler().MakeMuxer("/packages", router))
	router.HandleFunc("/validate-token", validateToken)
	router.HandleFunc("/sections", handleSections)
	router.HandleFunc("/time-info", handleTimeInfo)
	router.HandleFunc("/device-info", handleDeviceInfo)
	router.HandleFunc("/device-action", handleDeviceAction)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, path.Join(apiPath, "packages/internal/")) ||
			SimpleCookieCheck(w, r) == nil {
			router.ServeHTTP(w, r)
		} else {
			// in any other case, refuse the request and redirect
			http.Redirect(w, r, "/access-control", 401)
		}
	})
}

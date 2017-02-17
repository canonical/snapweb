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
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/snapcore/snapweb/snappy/app"
)

const apiVersion = "v2"

// Name of the cookie transporting the access token
const (
	SnapwebAuthTokenCookieName = "SnapwebLocalToken"
)

func tokenFilename() string {
	return filepath.Join(os.Getenv("SNAP_DATA"), "token.txt")
}

// ValidateRequestToken is a simple authorization mechanism
func ValidateRequestToken(w http.ResponseWriter, r *http.Request) error {
	cookie, _ := r.Cookie(SnapwebAuthTokenCookieName)
	if cookie != nil {
		token, err := ioutil.ReadFile(tokenFilename())
		if err == nil {
			if string(token) == cookie.Value {
				// the auth-token and the cookie do match
				// we can continue with the request
				return nil
			}
		}
	}
	return errors.New("Unauthorized")
}

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
	router.HandleFunc("/user-logout", handleUserLogout)
	router.HandleFunc("/user-profile", handleUserProfile)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO
		if ValidateRequestToken(w, r) != nil {
			http.Redirect(w, r, "/access-control", 403)
			return
		}
		router.ServeHTTP(w, r)
	})
}

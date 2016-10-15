/*
 * Copyright (C) 2014, 2015, 2016 Canonical Ltd
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
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/snapcore/snapd/dirs"

	// most other handlers use the ClientAdapter for now
	"github.com/snapcore/snapweb/snappy"
)

type branding struct {
	Name    string
	Subname string
}

type templateData struct {
	Branding     branding
	SnapdVersion string
}

var newSnapdClient = newSnapdClientImpl

func unixDialer(socketPath string) func(string, string) (net.Conn, error) {
	file, err := os.OpenFile(socketPath, os.O_RDWR, 0666)
	if err == nil {
		file.Close()
	}

	return func(_, _ string) (net.Conn, error) {
		return net.Dial("unix", socketPath)
	}
}

func newSnapdClientImpl() snappy.SnapdClient {
	return snappy.NewClientAdapter()
}

func getSnappyVersion() string {
	c := newSnapdClient()

	verInfo, err := c.ServerVersion()
	if err != nil {
		return "snapd"
	}

	return fmt.Sprintf("snapd %s (series %s)", verInfo.Version, verInfo.Series)
}

type timeInfoResponse struct {
	Date      string  `json:"date,omitempty"`
	Time      string  `json:"time,omitempty"`
	Timezone  float64 `json:"timezone,omitempty"`
	NTPServer string  `json:"ntpServer,omitempty"`
}

func handleTimeInfo(w http.ResponseWriter, r *http.Request) {

	SimpleCookieCheckOrRedirect(w, r)

	if r.Method == "GET" {
		values, err := snappy.GetCoreConfig(
			[]string{"Date", "Time", "Timezone", "NTPServer"})
		if err != nil {
			log.Println("Error extracting core config", err)
			return
		}

		info := timeInfoResponse{
			Date:      values["Date"].(string),
			Time:      values["Time"].(string),
			Timezone:  values["Timezone"].(float64),
			NTPServer: values["NTPServer"].(string),
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(info); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println("Error encoding time response", err)
		}
	} else if r.Method == "PATCH" {
		w.WriteHeader(http.StatusNotImplemented)
	}
}

type deviceInfoResponse struct {
	DeviceName string   `json:"deviceName"`
	Brand      string   `json:"brand"`
	Model      string   `json:"model"`
	Serial     string   `json:"serial"`
	OS         string   `json:"operatingSystem"`
	Interfaces []string `json:"interfaces"`
	Uptime     string   `json:"uptime"`
}

func handleDeviceInfo(w http.ResponseWriter, r *http.Request) {

	SimpleCookieCheckOrRedirect(w, r)

	c := newSnapdClient()

	modelInfo, err := snappy.GetModelInfo(c)
	if err != nil {
		log.Println(fmt.Sprintf("handleDeviceInfo: error retrieving model info: %s", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var info deviceInfoResponse
	info.DeviceName = modelInfo["DeviceName"].(string)
	info.Brand = modelInfo["Brand"].(string)
	info.Model = modelInfo["Model"].(string)
	info.Serial = modelInfo["Serial"].(string)
	info.OS = modelInfo["OS"].(string)
	info.Interfaces = modelInfo["Interfaces"].([]string)
	info.Uptime = modelInfo["Uptime"].(string)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(info); err != nil {
		log.Println(fmt.Sprintf("handleDeviceInfo: error serializing json: %s", err))
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func initURLHandlers(log *log.Logger) {
	log.Println("Initializing HTTP handlers...")
	snappyHandler := snappy.NewHandler()
	passThru := makePassthroughHandler(dirs.SnapdSocket, "/api")

	http.Handle("/api/v2/packages/", snappyHandler.MakeMuxer("/api/v2/packages"))

	http.HandleFunc("/api/v2/time-info", handleTimeInfo)
	http.HandleFunc("/api/v2/device-info", handleDeviceInfo)

	// the URLs below shouldn't be using SimpleCookieCheckOrRedirect

	http.HandleFunc("/api/v2/create-user", passThru)
	http.HandleFunc("/api/v2/login", passThru)

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	if iconDir, relativePath, err := snappy.IconDir(); err == nil {
		http.Handle(fmt.Sprintf("/%s/", relativePath), loggingHandler(http.FileServer(http.Dir(filepath.Join(iconDir, "..")))))
	} else {
		log.Println("Issues while getting icon dir:", err)
	}

	http.HandleFunc("/", makeMainPageHandler())
}

// Name of the cookie transporting the macaroon and discharge to authenticate snapd requests
const (
	SnapwebCookieName = "SM"
)

// The MacaroonCookie structure mirrors the User structure in snapd/client/login.go
type MacaroonCookie struct {
	Macaroon   string   `json:"macaroon,omitempty"`
	Discharges []string `json:"discharges,omitempty"`
}

// Writes the 'Authorization' header
// with macaroon and discharges extracted from mere cookies
func setAuthorizationHeader(req *http.Request, outreq *http.Request) {
	cookie, _ := req.Cookie(SnapwebCookieName)
	if cookie != nil {
		var mc MacaroonCookie
		unescaped, err := url.QueryUnescape(cookie.Value)
		if err != nil {
			log.Println("Error trying to unescape cookie string", err)
			return
		}
		dec := json.NewDecoder(strings.NewReader(unescaped))
		if err := dec.Decode(&mc); err != nil {
			// TODO: reset a broken cookie? just ignoring for now
			log.Println("Error trying to decode cookie: ", err)
			return
		}

		var buf bytes.Buffer
		fmt.Fprintf(&buf, `Macaroon root="%s"`, mc.Macaroon)
		for _, discharge := range mc.Discharges {
			fmt.Fprintf(&buf, `, discharge="%s"`, discharge)
		}
		outreq.Header.Set("Authorization", buf.String())
	}
}

// SimpleCookieCheckOrRedirect is a simplistic authorization mechanism
func SimpleCookieCheckOrRedirect(w http.ResponseWriter, r *http.Request) {
	// simply verifies the existence of a cookie for now
	cookie, _ := r.Cookie(SnapwebCookieName)
	if cookie == nil {
		http.Redirect(w, r, "/login", 401)
	}
}

func makePassthroughHandler(socketPath string, prefix string) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := &http.Client{
			Transport: &http.Transport{Dial: unixDialer(socketPath)},
		}

		log.Println(r.Method, r.URL.Path)

		// need to remove the RequestURI field
		// and remove the /api prefix from snapweb URLs
		r.URL.Scheme = "http"
		r.URL.Host = "localhost"
		r.URL.Path = strings.TrimPrefix(r.URL.Path, prefix)

		outreq, err := http.NewRequest(r.Method, r.URL.String(), r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		setAuthorizationHeader(r, outreq)

		resp, err := c.Do(outreq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Note: the client.Do method above only returns JSON responses
		//       even if it doesn't say so
		hdr := w.Header()
		hdr.Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)

		io.Copy(w, resp.Body)

	})
}

func loggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func getBranding() branding {
	return branding{
		Name:    "Ubuntu",
		Subname: "",
	}
}

func makeMainPageHandler() http.HandlerFunc {
	b := getBranding()
	v := getSnappyVersion()

	return func(w http.ResponseWriter, r *http.Request) {
		data := templateData{
			Branding:     b,
			SnapdVersion: v,
		}

		if err := renderLayout("index.html", &data, w); err != nil {
			log.Println(err)
		}
	}
}

func renderLayout(html string, data *templateData, w http.ResponseWriter) error {
	htmlPath := filepath.Join(os.Getenv("SNAP"), "www", "templates", html)
	if _, err := os.Stat(htmlPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	layoutPath := filepath.Join(os.Getenv("SNAP"), "www", "templates", "base.html")
	t, err := template.ParseFiles(layoutPath, htmlPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	return t.Execute(w, *data)
}

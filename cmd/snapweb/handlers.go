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
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	// "net/url"
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
	Branding     snappy.DeviceBranding
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

func handleBranding(h *snappy.Handler, w http.ResponseWriter, r *http.Request) {
	brandingData, err := snappy.GetBrandingData(h)
	if err != nil {
		log.Println("Cannot get branding data", err)
		// brandingData is still valid and we fallback to defaults
		// no matter what
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(brandingData); err != nil {
		log.Println("Error serializing branding json: ", err)
		w.WriteHeader(http.StatusInternalServerError)
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
	http.HandleFunc("/api/v2/create-user", passThru)

	http.HandleFunc("/api/v2/time-info", handleTimeInfo)
	http.HandleFunc("/api/v2/device-info", handleDeviceInfo)

	http.HandleFunc("/api/v2/branding-data", func(w http.ResponseWriter, r *http.Request) {
		handleBranding(snappyHandler, w, r)
	})

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	if iconDir, relativePath, err := snappy.IconDir(); err == nil {
		http.Handle(fmt.Sprintf("/%s/", relativePath), loggingHandler(http.FileServer(http.Dir(filepath.Join(iconDir, "..")))))
	} else {
		log.Println("Issues while getting icon dir:", err)
	}

	http.HandleFunc("/", makeMainPageHandler())
}

func makePassthroughHandler(socketPath string, prefix string) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := &http.Client{
			Transport: &http.Transport{Dial: unixDialer(socketPath)},
		}

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

		resp, err := c.Do(outreq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

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

func makeMainPageHandler() http.HandlerFunc {
	v := getSnappyVersion()

	return func(w http.ResponseWriter, r *http.Request) {
		data := templateData{
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

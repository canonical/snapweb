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
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"text/template"

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

func getSnappyVersion(c snappy.SnapdClient) string {
	verInfo, err := c.ServerVersion()
	if err != nil {
		return "snapd"
	}

	return fmt.Sprintf("snapd %s (series %s)", verInfo.Version, verInfo.Series)
}

type TimeInfoResponse struct {
	Date      string  `json:"date,omitempty"`
	Time      string  `json:"time,omitempty"`
	Timezone  float64 `json:"timezone,omitempty"`
	NTPServer string  `json:"ntpServer,omitempty"`
}

func handleTimeInfo(f snappy.NTPConfigurationFiles, w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		values, err := snappy.GetCoreConfig(
			f,
			[]string{"Date", "Time", "Timezone", "NTPServer"})
		if err != nil {
			log.Println("Error extracting core config", err)
			return
		}

		info := TimeInfoResponse{
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
		data, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println("Error decoding time patch", err)
			return
		}

		var timePatch map[string]interface{}
		err = json.Unmarshal(data, &timePatch)
		if err != nil {
			log.Println("Error decoding time data", err)
			return
		}

		snappy.SetCoreConfig(timePatch) // TODO: check result
	}
}

type DeviceInfoResponse struct {
	DeviceName string   `json:"deviceName"`
	Brand      string   `json:"brand"`
	Model      string   `json:"model"`
	Serial     string   `json:"serial"`
	OS         string   `json:"operatingSystem"`
	Interfaces []string `json:"interfaces"`
	Uptime     string   `json:"uptime"`
}

func handleDeviceInfo(c snappy.SnapdClient, w http.ResponseWriter, r *http.Request) {
	modelInfo, err := snappy.GetModelInfo(c)
	if err != nil {
		log.Println(fmt.Sprintf("handleDeviceInfo: error retrieving model info: %s", err))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var info DeviceInfoResponse
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

func initURLHandlers(c snappy.SnapdClient, f snappy.NTPConfigurationFiles, log *log.Logger) {
	log.Println("Initializing HTTP handlers...")
	snappyHandler := snappy.NewHandler()

	http.Handle("/api/v2/packages/", snappyHandler.MakeMuxer("/api/v2/packages"))

	http.HandleFunc("/api/v2/time-info", func(w http.ResponseWriter, r *http.Request) {
		handleTimeInfo(f, w, r)
	})
	http.HandleFunc("/api/v2/device-info", func(w http.ResponseWriter, r *http.Request) {
		handleDeviceInfo(c, w, r)
	})

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	if iconDir, relativePath, err := snappy.IconDir(); err == nil {
		http.Handle(fmt.Sprintf("/%s/", relativePath), loggingHandler(http.FileServer(http.Dir(filepath.Join(iconDir, "..")))))
	} else {
		log.Println("Issues while getting icon dir:", err)
	}

	http.HandleFunc("/", makeMainPageHandler(c))
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

func makeMainPageHandler(c snappy.SnapdClient) http.HandlerFunc {
	b := getBranding()
	v := getSnappyVersion(c)

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

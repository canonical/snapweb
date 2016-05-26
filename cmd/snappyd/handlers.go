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

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"text/template"

	"github.com/snapcore/snapd/client"

	"launchpad.net/webdm/snappy"
)

type slug string
type pages map[slug]string

type branding struct {
	Name    string
	Subname string
}

type templateData struct {
	Branding branding
}

var newSnapdClient = newSnapdClientImpl

func newSnapdClientImpl() snappy.SnapdClient {
	return client.New(nil)
}

func getSnappyVersion() string {
	c := newSnapdClient()

	if version, err := c.ServerVersion(); err != nil {
		return "Snappy"
	} else {
		return "Snappy " + version
	}
}

func initURLHandlers(log *log.Logger) {
	log.Println("Initializing HTTP handlers...")

	snappyHandler := snappy.NewHandler()
	http.Handle("/api/v2/packages/", snappyHandler.MakeMuxer("/api/v2/packages"))

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	if iconDir, relativePath, err := snappy.IconDir(); err == nil {
		http.Handle(fmt.Sprintf("/%s/", relativePath), loggingHandler(http.FileServer(http.Dir(filepath.Join(iconDir, "..")))))
	} else {
		log.Println("Issues while getting icon dir:", err)
	}

	http.HandleFunc("/", makeMainPageHandler())
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

	return func(w http.ResponseWriter, r *http.Request) {
		data := templateData{
			Branding: b,
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

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
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"text/template"

	"launchpad.net/webdm/oem"
	"launchpad.net/webdm/snappy"
)

type slug string
type pages map[slug]string

type branding struct {
	Name    string
	Subname string
}

var p = pages{
	"Admin":    "/admin",
	"Services": "/services",
}

type page struct {
	Pages  pages
	Title  string
	Params interface{}
}

func initURLHandlers(log *log.Logger) {
	log.Println("Initializing HTTP handlers...")

	http.HandleFunc("/api/v2/validate-token", validateToken)

	snappyHandler := snappy.NewHandler()
	http.Handle("/api/v2/packages/", snappyHandler.MakeMuxer("/api/v2/packages"))

	handleMainPage, err := makeMainPageHandler()
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir("./www"))))

	if iconDir, relativePath, err := snappy.IconDir(); err == nil {
		http.Handle(fmt.Sprintf("/%s/", relativePath), loggingHandler(http.FileServer(http.Dir(filepath.Join(iconDir, "..")))))
	} else {
		log.Println("Issues while getting icon dir:", err)
	}

	http.HandleFunc("/", handleMainPage)
}

// Name of the cookie transporting the access token
const (
	SnapwebCookieName = "SM"
)

func tokenFilename() string {
	return filepath.Join(os.Getenv("SNAP_DATA"), "token.txt")
}

// SimpleCookieCheckOrRedirect is a simple authorization mechanism
func SimpleCookieCheckOrRedirect(w http.ResponseWriter, r *http.Request) error {
	cookie, _ := r.Cookie(SnapwebCookieName)
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

	// in any other case, refuse the request and redirect
	http.Redirect(w, r, "/access-control", 401)

	return errors.New("Unauthorized")
}

func validateToken(w http.ResponseWriter, r *http.Request) {
	log.Println(r.Method, r.URL.Path)
	if err := SimpleCookieCheckOrRedirect(w, r); err == nil {
		hdr := w.Header()
		hdr.Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "{}")
	} else {
		hdr := w.Header()
		hdr.Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, "{}")
	}
}

func loggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func makeMainPageHandler() (f http.HandlerFunc, err error) {
	name := "Ubuntu"
	subname := ""

	// TODO: use oem information from github.com/ubuntu-core/snappy
	pkg, err := oem.Oem()
	if err != nil && err != oem.ErrNotFound {
		return f, err
	} else if err != oem.ErrNotFound {
		name = pkg.Branding.Name
		subname = pkg.Branding.Subname
	}

	return func(w http.ResponseWriter, r *http.Request) {
		data := page{
			Pages: p,
			Title: "Home",
			Params: branding{
				Name:    name,
				Subname: subname,
			},
		}

		if err := renderLayout("index.html", &data, w); err != nil {
			log.Println(err)
		}
	}, nil
}

func renderLayout(html string, data *page, w http.ResponseWriter) error {
	htmlPath := filepath.Join("www", "templates", html)
	if _, err := os.Stat(htmlPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	layoutPath := filepath.Join("www", "templates", "base.html")
	t, err := template.ParseFiles(layoutPath, htmlPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	return t.Execute(w, *data)
}

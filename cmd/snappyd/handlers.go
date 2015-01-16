/*
 * Copyright 2014 Canonical Ltd.
 *
 * Authors:
 * Michael Frey: michael.frey@canonical.com
 *
 * This file is part of snappy.
 *
 * usensord is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3.
 *
 * usensord is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package main

import (
	"log"
	"net/http"

	"launchpad.net/clapper/click"
	"launchpad.net/clapper/oem"
	"launchpad.net/clapper/store"
	"launchpad.net/clapper/system"
	"launchpad.net/go-dbus/v1"
)

type slug string
type pages map[slug]string

/*
func makeHandler(fn func(http.ResponseWriter, *http.Request, bytes.Buffer)) http.HandlerFunc {
	var buf bytes.Buffer
	t, _ := template.ParseFiles(filepath.Join("www", "templates", "navbar.html"))
	t.Execute(buf, p)

	return func(w http.ResponseWriter, r *http.Request) {
		fn(w, r, buf)
	}
}
*/

var p = pages{
	"Admin":    "/admin",
	"Services": "/services",
	"Store":    "/store",
}

type Page struct {
	Pages  pages
	Title  string
	Params interface{}
}

func InitURLHandlers(conn *dbus.Connection, log *log.Logger) {
	log.Println("Initializing HTTP handlers...")

	packageHandler := click.NewHandler(conn)
	http.Handle("/api/v1/packages/", packageHandler.MakeMuxer("/api/v1/packages"))

	storeHandler := store.NewHandler()
	http.Handle("/api/v1/store/", storeHandler.MakeMuxer("/api/v1/store"))

	oemHandler := oem.NewHandler()
	http.Handle("/api/v1/oem/", oemHandler.MakeMuxer("/api/v1/oem"))

	handleMainPage, err := makeMainPageHandler(conn)
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir("./www"))))
	http.Handle("/mock-api/", loggingHandler(http.FileServer(http.Dir("./www"))))

	http.HandleFunc("/", handleMainPage)
}

func loggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func makeMainPageHandler(conn *dbus.Connection) (f http.HandlerFunc, err error) {
	si, err := system.New(conn)
	if err != nil {
		return f, err
	}

	si.Init()

	http.Handle("/api/v1/systemimage/", si.MakeMuxer("/api/v1/systemimage"))

	return func(w http.ResponseWriter, r *http.Request) {
		data := Page{
			Pages:  p,
			Title:  "Home",
			Params: si.Info,
		}

		if err := renderTemplate("main.html", &data, w); err != nil {
			log.Println(err)
		}
	}, nil
}

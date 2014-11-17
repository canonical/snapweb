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

	"launchpad.net/clapper/system"
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

func InitURLHandlers(log *log.Logger) {
	log.Println("Initializing HTTP handlers...")

	http.Handle("/images/", loggingHandler(http.FileServer(http.Dir("./www/static"))))
	http.Handle("/stylesheets/", loggingHandler(http.FileServer(http.Dir("./www/static"))))

	http.HandleFunc("/", handleMainPage)
	http.HandleFunc(p["Admin"], handleAdminPage)
	http.HandleFunc(p["Services"], handleServicesPage)
	http.HandleFunc(p["Store"], handleStorePage)
}

func loggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func handleMainPage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	data := Page{
		Pages: p,
		Title: "Main",
	}

	if err := renderTemplate("main.html", &data, w); err != nil {
		log.Println(err)
	}
}

func handleAdminPage(w http.ResponseWriter, r *http.Request) {

	si, _ := system.New(conn, logger)

	data := Page{
		Pages:  p,
		Title:  "Admin",
		Params: si.Info,
	}

	if err := renderTemplate("admin.html", &data, w); err != nil {
		log.Println(err)
	}
}

func handleServicesPage(w http.ResponseWriter, r *http.Request) {
	services := getClickServices()

	data := Page{
		Pages:  p,
		Title:  "Services",
		Params: services,
	}

	if err := renderTemplate("services.html", &data, w); err != nil {
		log.Println(err)
	}
}

func handleStorePage(w http.ResponseWriter, r *http.Request) {
	data := Page{
		Pages: p,
		Title: "Store",
	}

	if err := renderTemplate("store.html", &data, w); err != nil {
		log.Println(err)
	}
}

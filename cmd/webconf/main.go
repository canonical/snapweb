/*
 * Copyright (C) 2017 Canonical Ltd
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
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"text/template"
	"time"

	"github.com/snapcore/snapd/dirs"

	"github.com/snapcore/snapweb/avahi"
	"github.com/snapcore/snapweb/snappy"
)

var logger *log.Logger

const (
	httpAddr string = ":4200"
)

func init() {
	logger = log.New(os.Stderr, "webconf: ", log.Ldate|log.Ltime|log.Lshortfile)
}

type branding struct {
	Name    string
	Subname string
}

type templateData struct {
	Branding     branding
	SnapdVersion string
}

func makeMainPageHandler() http.HandlerFunc {

	layoutPath := filepath.Join(os.Getenv("SNAP"), "www", "templates", "webconf.html")
	t, err := template.ParseFiles(layoutPath)
	if err != nil {
		logger.Fatalf("%v", err)
	}

	data := templateData{
		Branding: branding{
			Name:    "Ubuntu",
			Subname: "",
		},
		SnapdVersion: "snapd",
	}

	return func(w http.ResponseWriter, r *http.Request) {

		err = t.Execute(w, &data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.Println(err)
			return
		}

	}
}

func doneHandler(server net.Listener) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		snappy.SendSignalToSnapweb()
		if server != nil {
			server.Close()
		}
	}
}

func initURLHandlers(log *log.Logger, server net.Listener) {
	// API
	http.Handle("/api/v2/create-user",
		snappy.MakePassthroughHandler(dirs.SnapdSocket, "/api/v2/create-user"))
	http.HandleFunc("/done", doneHandler(server))

	// Resources
	http.Handle("/public/", snappy.LoggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	http.HandleFunc("/", makeMainPageHandler())
}

func main() {
	if snappy.IsDeviceManaged() {
		log.Println("webconf does not run on managed devices")
		os.Exit(0)
	}

	go avahi.InitMDNS(logger)

	// open a plain HTTP end-point on the "usual" 4200 port
	server, err := net.Listen("tcp", httpAddr)
	if err != nil {
		logger.Fatalf("%v", err)
	}

	initURLHandlers(logger, server)

	http.Serve(server, nil)

	// prepare to exit, but let snapweb start before that
	time.Sleep(2 * time.Second)
}

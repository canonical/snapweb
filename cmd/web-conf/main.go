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
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"text/template"

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapd/dirs"

	"github.com/snapcore/snapweb/avahi"
)

var logger *log.Logger

const (
	httpAddr string = ":4200"
)

func init() {
	logger = log.New(os.Stderr, "web-conf: ", log.Ldate|log.Ltime|log.Lshortfile)
}

// IsDeviceManaged determines if the device is in the 'managed' state
func IsDeviceManaged() bool {
	client := client.New(nil)

	sysInfo, err := client.SysInfo()
	if err != nil {
		panic(err)
	}

	if sysInfo.OnClassic || sysInfo.Managed {
		return true
	}

	return false
}

func unixDialer(socketPath string) func(string, string) (net.Conn, error) {
	file, err := os.OpenFile(socketPath, os.O_RDWR, 0666)
	if err == nil {
		file.Close()
	}

	return func(_, _ string) (net.Conn, error) {
		return net.Dial("unix", socketPath)
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

func sendSignalToSnapweb() {
	var pid int
	var err error

	pidFilePath := filepath.Join(os.Getenv("SNAP_DATA"), "snapweb.pid")

	if f, err := os.Open(pidFilePath); err == nil {
		if _, err = fmt.Fscanf(f, "%d\n", &pid); err == nil {
			p, _ := os.FindProcess(pid)
			err = p.Signal(syscall.Signal(syscall.SIGHUP))
		}
	}
	if err != nil {
		log.Println(err)
	}
}

func doneHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		logger.Fatal("webconf done")
	}
}

func initURLHandlers(log *log.Logger) {
	// API
	http.Handle("/api/", makePassthroughHandler(dirs.SnapdSocket, "/api/"))
	http.HandleFunc("/done", doneHandler())

	// Resources
	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	http.HandleFunc("/", makeMainPageHandler())
}

func main() {

	if IsDeviceManaged() {
		log.Println("web-conf does not run on managed devices")
		os.Exit(0)
	}

	initURLHandlers(logger)

	go avahi.InitMDNS(logger)

	// open a plain HTTP end-point on the "usual" 4200 port
	if err := http.ListenAndServe(httpAddr, nil); err != nil {
		logger.Fatalf("%v", err)
	}

}

/*
 * Copyright (C) 2014-2016 Canonical Ltd
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
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/snapcore/snapweb/avahi"
)

var logger *log.Logger

const (
	httpAddr  string = ":4200"
	httpsAddr string = ":4201"
)

func init() {
	logger = log.New(os.Stderr, "Snapweb: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func redir(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req,
		"https://"+strings.Replace(req.Host, httpAddr, httpsAddr, -1),
		http.StatusMovedPermanently)
}

func main() {
	GenerateCertificate()

	initURLHandlers(logger)

	go avahi.InitMDNS(logger)

	logger.Println("Snapweb starting...")

	// run the main service over HTTPS
	go func() {
		certFile := filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
		keyFile := filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")
		if err := http.ListenAndServeTLS(httpsAddr, certFile, keyFile, nil); err != nil {
			logger.Fatalf("http.ListendAndServerTLS() failed with %v", err)
		}
	}()

	// open a plain HTTP end-point on the "usual" 4200 port, and redirect to HTTPS
	if err := http.ListenAndServe(httpAddr, http.HandlerFunc(redir)); err != nil {
		logger.Fatalf("ListenAndServe failed with: %v", err)
	}

}

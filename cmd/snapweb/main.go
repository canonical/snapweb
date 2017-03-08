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
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/snapcore/snapweb/avahi"
)

var logger *log.Logger

var httpAddr string  // set from go build ldflags
var httpsAddr string // set from go build ldflags

func init() {
	logger = log.New(os.Stderr, "Snapweb: ", log.Ldate|log.Ltime|log.Lshortfile)

	if len(httpAddr) == 0 {
		httpAddr = ":4200"
	}
	if len(httpsAddr) == 0 {
		httpsAddr = ":4201"
	}
}

func redir(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req,
		"https://"+strings.Replace(req.Host, httpAddr, httpsAddr, -1),
		http.StatusSeeOther)
}

func main() {
	config := readConfig()

	// TODO set warning for too hazardous config?

	initURLHandlers(logger, config)

	go avahi.InitMDNS(logger)

	logger.Println("Snapweb starting...")

	// open a plain HTTP end-point on the "usual" 4200 port, and
	// possibly redirect to HTTPS
	handler := http.HandlerFunc(redir)
	if !config.DisableHTTPS {
		DumpCertificate()

		go func() {
			certFile := filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
			keyFile := filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")
			if err := http.ListenAndServeTLS(httpsAddr, certFile, keyFile, nil); err != nil {
				logger.Fatalf("http.ListendAndServerTLS() failed with %v", err)
			}
		}()
	} else {
		handler = nil
	}

	if err := http.ListenAndServe(httpAddr, handler); err != nil {
		logger.Fatalf("ListenAndServe failed with: %v", err)
	}

}

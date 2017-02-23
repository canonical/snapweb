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
	"time"

	"github.com/snapcore/snapweb/avahi"
	"github.com/snapcore/snapweb/snappy/app"
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

	for !IsDeviceManaged() {
		logger.Println("Snapweb cannot run until the device is managed...")
		snappy.WritePidFile()
		snappy.WaitForSigHup()
		// wait futher more, to let webconf release the 4200 port
		time.Sleep(1000)
	}

	// TODO set warning for too hazardous config?
	config, err := snappy.ReadConfig()
	if err != nil {
		logger.Fatal("Configuration error", err)
	}

	mainHandler := initURLHandlers(logger, config)
	baseHandler := redirHandler(config)

	go avahi.InitMDNS(logger)

	logger.Println("Snapweb starting...")

	if !config.DisableHTTPS {
		CreateCertificateIfNeeded()

		go func() {
			certFile := filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
			keyFile := filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")
			if err := http.ListenAndServeTLS(httpsAddr, certFile, keyFile, mainHandler); err != nil {
				logger.Fatalf("http.ListendAndServerTLS() failed with %v", err)
			}
		}()

	} else {
		// don't redirect, just serve with the main HTTP handler
		baseHandler = mainHandler
	}

	// open a plain HTTP end-point on the "usual" 4200 port
	// redirect to HTTPS if enabled, otherwise serve on HTTP
	if err := http.ListenAndServe(httpAddr, baseHandler); err != nil {
		logger.Fatalf("ListenAndServe failed with: %v", err)
	}
}

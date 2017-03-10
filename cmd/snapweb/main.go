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

	"github.com/snapcore/snapweb/avahi"
	"github.com/snapcore/snapweb/snappy/app"
)

var logger *log.Logger

const (
	httpAddr  string = ":4200"
	httpsAddr string = ":4201"
)

func init() {
	logger = log.New(os.Stderr, "Snapweb: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func main() {
	// TODO set warning for too hazardous config?
	config, err := snappy.ReadConfig()
	if err != nil {
		logger.Fatalf("Configuration error", err)
	}

	mainHandler := initURLHandlers(logger, config)
	baseHandler := redirHandler(config)

	go avahi.InitMDNS(logger)

	logger.Println("Snapweb starting...")

	if !config.DisableHTTPS {
		DumpCertificate()

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

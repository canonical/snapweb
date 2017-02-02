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
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"

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
		http.StatusSeeOther)
}

func WaitForWebConfSignal() {
	var waiter sync.WaitGroup
	waiter.Add(1)
	var sigchan chan os.Signal
	sigchan = make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGHUP)
	go func() {
		<-sigchan
		waiter.Done()
	}()
	waiter.Wait()
}

func main() {
	config := readConfig()

	for ! IsDeviceManaged() {
		logger.Println("Snapweb cannot run until the device is managed...")
		WaitForWebConfSignal()
	}

	GenerateCertificate()

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

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

	"github.com/snapcore/snapd/client"
	"github.com/snapcore/snapweb/avahi"
)

var logger *log.Logger

const (
	httpAddr  string = ":4200"
	// httpsAddr string = ":4201"
)

func init() {
	logger = log.New(os.Stderr, "Snapweb/firstboot: ", log.Ldate|log.Ltime|log.Lshortfile)
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

func initURLHandlers(log *log.Logger) {
	// API
	http.Handle("/api/", makeAPIHandler("/api/"))

	// Resources
	http.Handle("/public/", loggingHandler(http.FileServer(http.Dir(filepath.Join(os.Getenv("SNAP"), "www")))))

	http.HandleFunc("/", makeMainPageHandler())
}

func main() {

	if IsDeviceManaged() {
		panic("The Snapweb/Firstboot module does not run on managed devices")
	}

	initURLHandlers(logger)

	go avahi.InitMDNS(logger)

	// open a plain HTTP end-point on the "usual" 4200 port
	if err := http.ListenAndServe(httpAddr, nil); err != nil {
		logger.Fatalf("%v", err)
	}

}

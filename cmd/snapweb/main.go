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

	"github.com/snapcore/snapweb/snappy"
	"github.com/snapcore/snapweb/avahi"
)

var logger *log.Logger

const httpAddr string = ":4200"

func init() {
	logger = log.New(os.Stderr, "Snapweb: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func main() {
	initURLHandlers(logger)

	go avahi.InitMDNS(logger)

	logger.Println("Snapweb starting...")

	if err := http.ListenAndServe(httpAddr, nil); err != nil {
		logger.Printf("http.ListendAndServer() failed with %s\n", err)
	}
}

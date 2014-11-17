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
	"os"

	"launchpad.net/go-dbus/v1"
)

var (
	logger   *log.Logger
	httpAddr string
	conn     *dbus.Connection
	err      error
)

func init() {
	logger = log.New(os.Stderr, "Snappy: ", log.Ldate|log.Ltime|log.Lshortfile)
	httpAddr = ":8080"
}

func main() {

	logger.Println("Connecting to System Bus")
	if conn, err = dbus.Connect(dbus.SystemBus); err != nil {
		logger.Fatal("Connection error:", err)
	}

	InitURLHandlers(logger)

	logger.Println("Snappy starting...")

	if err := http.ListenAndServe(httpAddr, nil); err != nil {
		logger.Printf("http.ListendAndServer() failed with %s\n", err)
	}

}

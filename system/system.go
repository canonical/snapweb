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

package system

import (
	"log"

	"launchpad.net/go-dbus/v1"
)

var (
	conn   *dbus.Connection
	logger *log.Logger
)

type System struct {
	conn *dbus.Connection
	Info map[string]string
}

func New(conn *dbus.Connection, log *log.Logger) (*System, error) {

	logger = log

	logger.Println("Getting System Info")
	obj := conn.Object("com.canonical.SystemImage", "/Service")
	reply, err := obj.Call("com.canonical.SystemImage", "Information")

	if err != nil || reply.Type == dbus.TypeError {
		logger.Println("Error getting System Image Info %s", err)
		return nil, err
	}

	information := make(map[string]string)

	if err := reply.Args(&information); err != nil {
		logger.Println("Error getting System Image Info Properties")
		return nil, err
	}

	for k, v := range information {
		logger.Println(k, v)
	}

	return &System{conn: conn, Info: information}, nil

}

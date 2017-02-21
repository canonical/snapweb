/*
 * Copyright (C) 2014-2015 Canonical Ltd
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

package avahi

import (
	"fmt"
	"github.com/presotto/go-mdns-sd"
	"log"
	"os"
	"strings"
	"sync"
	"time"
)

var logger *log.Logger

type mdnsScanner interface {
	ScanInterfaces() (string, error)
}

var _mdns mdnsScanner

var initOnce sync.Once

const hostnameDefault = "snapweb"

const addressUpdateDelay = 3 * time.Second

var defaultNewMDNS = func(hostname, p1, p2 string, p3 bool, p4 int) (mdnsScanner, error) {
	return mdns.NewMDNS(hostname, p1, p2, p3, p4)
}

var newMDNS = defaultNewMDNS

// InitMDNS initializes the avahi subsystem.
func InitMDNS(l *log.Logger) error {
	logger = l

	// the hostname is read once on startup; there is no Linux interface to
	// pickup hostname changes, so either polling has to be used to detect
	// these or snapweb has to be restarted
	var err error
	hostname := getHostname()
	logger.Println("Registering hostname:", hostname)
	_mdns, err = newMDNS(hostname, "", "", false, 0)
	if err != nil {
		logger.Println("Cannot create mDNS instance:", err)
		return fmt.Errorf("Cannot create mDNS instance: %s", err.Error())
	}
	// poll to update published IP addresses for this mDNS name; ideally
	// we'd use something like netlink to trigger updates to avoid wakeups;
	// this might require extra permissions though
	initOnce.Do(addressUpdateLoop)
	return nil
}

func addressUpdateLoop() {
	timer := time.NewTimer(addressUpdateDelay)

	{
		if _mdns != nil {
			_mdns.ScanInterfaces()
		}
		timer.Reset(addressUpdateDelay)
		<-timer.C
	}
}

var osHostname = os.Hostname

func getHostname() (hostname string) {
	hostname, err := osHostname()
	if err != nil {
		logger.Println("Cannot obtain hostname, using default:", err)
		return hostnameDefault
	}
	hostname = strings.Split(hostname, ".")[0]
	if hostname == "localhost" {
		hostname = hostnameDefault
	}
	return hostname
}

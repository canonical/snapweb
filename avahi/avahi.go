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
	"log"
	"net"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/presotto/go-mdns-sd"
)

var logger *log.Logger

var _mdns *mdns.MDNS

var initOnce sync.Once

const (
	hostnameLocalhost = "localhost"
	hostnameWedbm     = "webdm"
)

const timeoutMinutes = 10
//const inAddr = `%s.local. 60 IN A %s`
//const inPtr = `%s.in-addr.arpa. 60 IN PTR %s.local.`

//var mdnsPublish = mdns.Publish

func tryPublish(hostname, ip string) {
	//rr := fmt.Sprintf(inAddr, hostname, ip)

	//logger.Println("Publishing", rr)

	//if err := mdnsPublish(rr); err != nil {
	//	logger.Printf(`Unable to publish record "%s": %v`, rr, err)
	//	return
	//}
}

var netInterfaceAddrs = net.InterfaceAddrs

func ipAddrs() (addrs []net.Addr, err error) {
	ifaces, err := netInterfaceAddrs()
	if err != nil {
		return nil, err
	}

	for _, iface := range ifaces {
		addrs = append(addrs, iface)
	}

	return addrs, nil
}

// Init initializes the avahi subsystem.
func Init(l *log.Logger) {
	logger = l

	var err error
	hostname := getHostname()
	logger.Println("Registering hostname: ", hostname)
	_mdns, err = mdns.NewMDNS(hostname, "", "", false, 1)
	if err != nil {
		logger.Println("Cannot create MDNS instance:", err)
		return
	}
	initOnce.Do(timeoutLoop)
}

func timeoutLoop() {
	timeout := time.NewTimer(3*time.Second)
	//timeout := time.NewTimer(timeoutMinutes * time.Minute)

	for {
		logger.Println("loop")
		if _mdns != nil {
			logger.Println("scan")
			_mdns.ScanInterfaces()
		}
		loop()
		//timeout.Reset(timeoutMinutes * time.Minute)
		timeout.Reset(3*time.Second)
		<-timeout.C
	}
}

var osHostname = os.Hostname

func getHostname() (hostname string) {
	hostname, err := osHostname()
	if err != nil {
		logger.Println("Cannot obtain hostname, falling back to default:", err)
		return hostnameWedbm
	}
	hostname = strings.Split(hostname, ".")[0]
	if hostname == hostnameLocalhost {
		hostname = hostnameWedbm
	}
	return hostname
}

func loop() {
	addrs, err := ipAddrs()
	if err != nil {
		logger.Println("Cannot obtain IP addresses:", err)
		return
	}

	hostname, err := osHostname()
	if err != nil {
		logger.Println("Cannot obtain hostname:", err)
		return
	}

	if strings.ContainsRune(hostname, '.') {
		hostname = strings.Split(hostname, ".")[0]
	}

	if hostname == hostnameLocalhost {
		hostname = hostnameWedbm
	}

	for _, ip := range addrs {
		ip := strings.Split(ip.String(), "/")[0]
		if strings.HasPrefix(ip, "127.") {
			continue
		}

		tryPublish(hostname, ip)
	}
}

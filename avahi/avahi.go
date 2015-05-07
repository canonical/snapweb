package avahi

import (
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"github.com/davecheney/mdns"
)

var logger *log.Logger

const (
	hostnameLocalhost = "localhost"
	hostnameWedbm     = "webdm"
)

const inAddr = `%s.local. 60 IN A %s`
const inPtr = `%s.in-addr.arpa. 60 IN PTR %s.local.`

func tryPublish(hostname, ip string) {
	rr := fmt.Sprintf(inAddr, hostname, ip)

	logger.Println("Publishing", rr)

	if err := mdns.Publish(rr); err != nil {
		logger.Printf(`Unable to publish record "%s": %v`, rr, err)
		return
	}
}

func ipAddrs() (addrs []net.Addr, err error) {
	ifaces, err := net.InterfaceAddrs()
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

	for {
		loop()
		<-time.After(10 * time.Minute)
	}
}

func loop() {
	addrs, err := ipAddrs()
	if err != nil {
		logger.Println("Cannot obtain IP addresses:", err)
		return
	}

	hostname, err := os.Hostname()
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

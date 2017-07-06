/*
 * Copyright (C) 2017 Canonical Ltd
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

package snappy

import (
	"fmt"
	"log"
	"net"
	"net/http"
)

// NetFilter manages an IP-based filter to limit access to Snapweb
type NetFilter struct {
	allowedNetworks []*net.IPNet
	acceptCache     net.IP
}

// NewFilter creates a new empty NetFilter to block all connections by default
func NewFilter() *NetFilter {
	return &NetFilter{}
}

// IsAllowed verifies if an IP is allowed to access Snapweb
func (f *NetFilter) IsAllowed(ip net.IP) bool {
	if ip == nil {
		return false
	}

	// if an IP was already checked for, accept it again
	if ip.Equal(f.acceptCache) {
		return true
	}

	// check "allow" rules
	for _, n := range f.allowedNetworks {
		if n.Contains(ip) {
			f.acceptCache = ip
			return true
		}
	}

	// block by default
	return false
}

// AllowNetwork adds a network definition (CIDR format) to the list of allowed networks
func (f *NetFilter) AllowNetwork(network string) error {
	// look for a network expression
	if _, net, err := net.ParseCIDR(network); err == nil {
		f.allowedNetworks = append(f.allowedNetworks, net)
	} else {
		log.Println("unable to parse", network, "ignoring it")
		return fmt.Errorf("Invalid network CIDR %s", network)
	}

	return nil
}

// AddLocalNetworks enumerates local interfaces and adds the networks they belong to
// to the list of allowed networks. This essentially says:
// connections originating from any of the local networks are authorized,
// anything else is refused
func (f *NetFilter) AddLocalNetworks() {
	iflist, err := networkInterfaces()
	if err != nil {
		log.Println("Unable to enumerate network interfaces", err.Error())
		return
	}

	for _, intf := range iflist {
		f.AddLocalNetworkForInterface(intf.Name)
	}
}

// AddLocalNetworkForInterface adds the network for a given interface to the list of allowed
// networks
func (f *NetFilter) AddLocalNetworkForInterface(ifname string) {
	intf, err := networkInterfaceByName(ifname)
	if err != nil {
		log.Println("Error with interface", ifname, err.Error())
		return
	}

	addrs, err := networkInterfaceAddresses(intf)
	if err != nil {
		log.Println("Error adding interface", intf.Name, err.Error())
		return
	}

	for _, a := range addrs {
		if ipnet, ok := a.(*net.IPNet); ok {
			if ipnet.IP.IsLoopback() {
				f.AllowNetwork(ipnet.String())
			} else if ipnet.IP.To4() != nil {
				// only consider IPv4 networks
				// only consider class-C networks, ie with 256 hosts max.
				if ones, _ := ipnet.Mask.Size(); ones >= 24 {
					f.AllowNetwork(ipnet.String())
				}
			} // TODO: add proper IPV6 support
		}
	}

}

// FilterHandler wraps and limits access to an http.Handler with the help of a NetFilter
func (f *NetFilter) FilterHandler(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host, _, _ := net.SplitHostPort(r.RemoteAddr)
		ip := net.ParseIP(host)
		if !f.IsAllowed(ip) {
			// Before finally accept or deny access to incoming request, let's check current
			// networks connected to the device and update allowed networks list. Re-test
			// if origin host is allowed or not after it.
			// This should prevent the case of snap service be started before some of
			// the local networks are connected and the requester is in that lazy network.
			// First ip check is made before this, as not to penalize allowed requests
			// executing unnecessary network updates.
			f.AddLocalNetworks()
			if !f.IsAllowed(ip) {
				log.Println("Unauthorized access from", r.RemoteAddr)
				http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
				return
			}
		}
		handler.ServeHTTP(w, r)
	})

}

// helper methods. They let us mock network interfaces in unit test, or use here the real ones.
var networkInterfaceByName = func(ifname string) (*net.Interface, error) {
	return net.InterfaceByName(ifname)
}

var networkInterfaceAddresses = func(iface *net.Interface) ([]net.Addr, error) {
	return iface.Addrs()
}

var networkInterfaces = func() ([]net.Interface, error) {
	return net.Interfaces()
}

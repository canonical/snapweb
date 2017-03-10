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
func (f *NetFilter) AllowNetwork(network string) {

	// look for a network expression
	if _, net, err := net.ParseCIDR(network); err == nil {
		f.allowedNetworks = append(f.allowedNetworks, net)
	} else {
		log.Println("unable to parse", network, "ignoring it")
	}

}

// getLocalNetworks enumerates local interfaces and adds the networks they belong to
// to the list of allowed networks. This essentially says:
// connections originating from any of the local networks are authorized,
// anything else is refused
func getLocalNetworks() []string {

	var networks []string

	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Println("error with network interfaces", err.Error())
		return networks
	}

	for _, a := range addrs {
		if ipnet, ok := a.(*net.IPNet); ok {
			// only consider IPv4 networks
			if ipnet.IP.To4() != nil {
				// only consider class-C networks, ie with 256 hosts max.
				if ones, _ := ipnet.Mask.Size(); ones >= 24 {
					networks = append(networks, ipnet.String())
				} else if ipnet.IP.IsLoopback() {
					networks = append(networks, ipnet.String())
				}
			}
		}
	}

	return networks
}

// FilterHandler wraps and limits access to an http.Handler with the help of a NetFilter
func (f *NetFilter) FilterHandler(handler http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host, _, _ := net.SplitHostPort(r.RemoteAddr)
		ip := net.ParseIP(host)
		if !f.IsAllowed(ip) {
			log.Println("Unauthorized access from", r.RemoteAddr)
			http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
			return
		}
		handler.ServeHTTP(w, r)
	})

}

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

type NetFilter struct {
	AllowedNetworks []*net.IPNet
	acceptCache net.IP
}

func NewFilter() *NetFilter {
	f := &NetFilter{
		AllowedNetworks: nil,
		acceptCache: nil,
	}

	return f
}

func (f *NetFilter) IsAllowed(ip net.IP) bool {
	if ip == nil {
		return false
	}

	// if an IP was already checked for, accept it again
	if ip.Equal(f.acceptCache) {
		return true
	}

	// check "allow" rules
	for _, n := range f.AllowedNetworks {
		if n.Contains(ip) {
			f.acceptCache = ip
			return true
		}
	}

	// block by default
	return false
}

func (f *NetFilter) AllowNetwork(network string) {

	// look for a network expression
	if _, net, err := net.ParseCIDR(network); err == nil {
		f.AllowedNetworks = append(f.AllowedNetworks, net)
	}

}

// FilterHandler verifies if a request originates from an authorized IP address
func (f *NetFilter) FilterHandler(handler http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host, _, err := net.SplitHostPort(r.RemoteAddr)
		if err == nil {
			ip := net.ParseIP(host)
			if f.IsAllowed(ip) {
				handler.ServeHTTP(w, r)
				return
			}
		}

		log.Println("Unauthorized access from", host, err)
		http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
	})
	
}

func getLocalNetworks() []string {

	var networks []string
	
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Println("error with network interfaces", err.Error());
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

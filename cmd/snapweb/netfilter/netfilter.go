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

package netfilter

import (
	"log"
	"net"
	"net/http"
)

type NetFilter struct {
	BlockedByDefault bool
	AllowedIPs []net.IP
	AllowedNetworks []*net.IPNet
	BlockedIPs []net.IP
	BlockedNetworks []*net.IPNet
	acceptCache net.IP
}

func New() *NetFilter {
	f := &NetFilter{
		BlockedByDefault: true,
		AllowedIPs: nil,
		AllowedNetworks: nil,
		BlockedIPs: nil,
		BlockedNetworks: nil,
		acceptCache: nil,
	}

	return f
}

func NewAndAllowByDefault() *NetFilter {
	f := New()
	f.BlockedByDefault = false

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

	// check explicit "block" rules
	for _, i := range f.BlockedIPs {
		if ip.Equal(i) {
			return false
		}
	}

	for _, n := range f.BlockedNetworks {
		if n.Contains(ip) {
			return false
		}
	}
	
	// if open by default, then we can conclude already
	if f.BlockedByDefault == false {
		f.acceptCache = ip
		return true
	}

	// check "allow" rules
	for _, i := range f.AllowedIPs {
		if ip.Equal(i) {
			f.acceptCache = ip
			return true
		}
	}

	for _, n := range f.AllowedNetworks {
		if n.Contains(ip) {
			f.acceptCache = ip
			return true
		}
	}

	// block by default
	return false
}

func (f *NetFilter) addRule(rule string, allow bool) bool {

	// look for a network expression first
	if _, net, err := net.ParseCIDR(rule); err == nil {
		if (allow) {
			f.AllowedNetworks = append(f.AllowedNetworks, net)
		} else {
			f.AllowedNetworks = append(f.BlockedNetworks, net)
		}
		return true
	}

	// otherwise, this is just an ip address
	if ip := net.ParseIP(rule); ip != nil {
		if (allow) {
			f.AllowedIPs = append(f.AllowedIPs, ip)
		} else {
			f.AllowedIPs = append(f.BlockedIPs, ip)
		}
		return true
	}

	// TODO: print a warning
	
	return false
}

func (f *NetFilter) Allow(rule string) bool {
	return f.addRule(rule, true)
}

func (f *NetFilter) Block(rule string) bool {
	return f.addRule(rule, false)
}

// makeAPIHandler create a handler for all API calls that need authorization
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

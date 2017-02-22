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

package main

import (
	"bufio"
	"log"
	"os"
	"strings"
	"time"

	"github.com/godbus/dbus"
	"gopkg.in/ini.v1"
)

var timesyncdConfigurationFilePath = "/etc/systemd/timesyncd.conf"

// Write back directly, rather than write-tmp(in same dir)+rename, as per the
// internals of ini package, although better, write accessible locations may
// not be on the same filesystem, removing the advantage.
//  : timeserver-control grants rw access to /etc/systemd/timesyncd.conf
func saveTimeSyncd(confFile *ini.File) error {
	timesyncConf, err := os.OpenFile(timesyncdConfigurationFilePath, os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}

	defer timesyncConf.Close()

	w := bufio.NewWriter(timesyncConf)
	_, err = confFile.WriteTo(w)
	if err != nil {
		return err
	}
	w.Flush()
	return nil
}

func writeNTPServer(ntpServer string) error {
	timesyncd, err := ini.Load(timesyncdConfigurationFilePath)
	if err != nil {
		return err
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil {
		return err
	}

	if section.HasKey("NTP") {
		ntpKey := section.Key("NTP")
		servers := ntpKey.Strings(" ")

		if ntpServer == "" {
			if len(servers) > 0 {
				servers = servers[1:]
			}
			if len(servers) == 0 {
				section.DeleteKey("NTP")
			} else {
				ntpKey.SetValue(strings.Join(servers, " "))
			}
		} else {
			if len(servers) > 0 && servers[0] == ntpServer {
				return nil
			}
			servers = append([]string{ntpServer}, servers...)
			ntpKey.SetValue(strings.Join(servers, " "))
		}
	} else {
		if ntpServer == "" {
			return nil
		}
		_, err = section.NewKey("NTP", ntpServer)
		if err != nil {
			return err
		}
	}

	return saveTimeSyncd(timesyncd)
}

func setTimeInfo(patch map[string]interface{}) error {
	for k, v := range patch {
		if k == "ntp" {
			ntp := v.(bool)

			bus, err := dbus.SystemBus()
			if err != nil {
				return err
			}

			timedatectl := bus.Object("org.freedesktop.timedate1", "/org/freedesktop/timedate1")
			call := timedatectl.Call("org.freedesktop.timedate1.SetNTP", 0, ntp, false)
			if call.Err != nil {
				return call.Err
			}
		} else if k == "ntpServer" {
			if err := writeNTPServer(v.(string)); err != nil {
				return err
			}
		} else if k == "dateTime" {
			dateTime := v.(float64) * 1000000

			bus, err := dbus.SystemBus()
			if err != nil {
				return err
			}

			timedatectl := bus.Object("org.freedesktop.timedate1", "/org/freedesktop/timedate1")
			call := timedatectl.Call("org.freedesktop.timedate1.SetTime", 0, int64(dateTime), false, false)
			if call.Err != nil {
				return call.Err
			}
		} else if k == "timezone" {
			timezone := v.(string)

			bus, err := dbus.SystemBus()
			if err != nil {
				return err
			}

			timedatectl := bus.Object("org.freedesktop.timedate1", "/org/freedesktop/timedate1")
			call := timedatectl.Call("org.freedesktop.timedate1.SetTimezone", 0, timezone, false)
			if call.Err != nil {
				return call.Err
			}
		}
	}

	return nil
}

func readNTPServer() string {
	timesyncd, err := ini.Load(timesyncdConfigurationFilePath)
	if err != nil {
		log.Printf("readNTPServer: unable to read %s", timesyncdConfigurationFilePath)
		return ""
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		return ""
	}

	servers := section.Key("NTP").Strings(" ")
	if len(servers) == 0 {
		return ""
	}

	return servers[0]
}

func getTimeInfo() (map[string]interface{}, error) {
	bus, err := dbus.SystemBus()
	if err != nil {
		return map[string]interface{}{}, err
	}

	timedatectl := bus.Object("org.freedesktop.timedate1", "/org/freedesktop/timedate1")
	timezone, err := timedatectl.GetProperty("org.freedesktop.timedate1.Timezone")
	if err != nil {
		return map[string]interface{}{}, err
	}

	ntp, err := timedatectl.GetProperty("org.freedesktop.timedate1.NTP")
	if err != nil {
		return map[string]interface{}{}, err
	}

	return map[string]interface{}{
		"DateTime":  time.Now().Unix(),
		"Timezone":  timezone.Value().(string),
		"NTP":       ntp.Value().(bool),
		"NTPServer": readNTPServer(),
	}, nil
}

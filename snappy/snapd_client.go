/*
 * Copyright (C) 2016 Canonical Ltd
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
	"os"
	"strings"
	"time"

	"github.com/snapcore/snapd/client"
	"gopkg.in/ini.v1"
)

const timesyncdPath string = "/etc/systemd/timesyncd.conf"

// SnapdClient is a client of the snapd REST API
type SnapdClient interface {
	Icon(name string) (*client.Icon, error)
	Snap(name string) (*client.Snap, *client.ResultInfo, error)
	List(names []string) ([]*client.Snap, error)
	Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error)
	Install(name string, options *client.SnapOptions) (string, error)
	Remove(name string, options *client.SnapOptions) (string, error)
	ServerVersion() (*client.ServerVersion, error)
	SetCoreConfig(patch map[string]interface{}) (string, error)
	GetCoreConfig(keys []string) (map[string]interface{}, error)
}

// ClientAdapter adapts our expectations to the snapd client API.
type ClientAdapter struct {
	snapdClient *client.Client
}

// NewClientAdapter creates a new ClientAdapter for use in snapweb.
func NewClientAdapter() *ClientAdapter {
	return &ClientAdapter{
		snapdClient: client.New(nil),
	}
}

// Icon returns the Icon belonging to an installed snap.
func (a *ClientAdapter) Icon(name string) (*client.Icon, error) {
	return a.snapdClient.Icon(name)
}

// Snap returns the most recently published revision of the snap with the
// provided name.
func (a *ClientAdapter) Snap(name string) (*client.Snap, *client.ResultInfo, error) {
	return a.snapdClient.Snap(name)
}

// List returns the list of all snaps installed on the system
// with names in the given list; if the list is empty, all snaps.
func (a *ClientAdapter) List(names []string) ([]*client.Snap, error) {
	return a.snapdClient.List(names)
}

// Find returns a list of snaps available for install from the
// store for this system and that match the query
func (a *ClientAdapter) Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error) {
	return a.snapdClient.Find(opts)
}

// Install adds the snap with the given name from the given channel (or
// the system default channel if not).
func (a *ClientAdapter) Install(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Install(name, options)
}

// Remove removes the snap with the given name.
func (a *ClientAdapter) Remove(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Remove(name, options)
}

// ServerVersion returns information about the snapd server.
func (a *ClientAdapter) ServerVersion() (*client.ServerVersion, error) {
	return a.snapdClient.ServerVersion()
}

// internal
func readNTPServer() string {
	timesyncd, err := ini.Load(timesyncdPath)
	if err != nil {
		log.Println("readNTPServer: unable to read /etc/system/timesyncd.conf")
		return ""
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		log.Println("readNTPServer: no NTP servers are set")
		return ""
	}

	return section.Key("NTP").Strings(" ")[0]
}

// Write back directly, rather than write-tmp(in same dir)+rename, as per the
// internals of ini package, although better, write accessible locations may
// not be on the same filesystem, removing the advantage.
//  : timeserver-control grants rw access to /etc/systemd/timesyncd.conf
func saveTimeSyncd(confFile *ini.File) error {
	timesyncConf, err := os.OpenFile(timesyncdPath, os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		log.Printf("saveTimeSyncd: Failed to open conf file: %v", err)
		return err
	}

	defer timesyncConf.Close()

	_, err = confFile.WriteTo(timesyncConf)
	if err != nil {
		log.Printf("saveTimeSyncd: Failed to write conf file: %v", err)
		return err
	}
	return nil
}

func writeNTPServer(ntpServer string) error {
	timesyncd, err := ini.Load(timesyncdPath)
	if err != nil {
		log.Printf("writeNTPServer: unable to read /etc/system/timesyncd.conf: %v", err)
		return err
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		log.Println("writeNTPServer: no NTP servers are set")
		return err
	}

	ntpKey := section.Key("NTP")
	servers := ntpKey.Strings(" ")
	if servers[0] == ntpServer {
		log.Println("writeNTPServer: NTP server already set")
		return nil
	}

	servers = append([]string{ntpServer}, servers...)
	ntpKey.SetValue(strings.Join(servers, " "))

	saveTimeSyncd(timesyncd)

	return nil
}

// SetCoreConfig sets some aspect of core configuration
func (a *ClientAdapter) SetCoreConfig(patch map[string]interface{}) (string, error) {
	for k, v := range patch {
		fmt.Printf("%s=%v\n", k, v)
	}

	return "", nil
}

// GetCoreConfig gets some aspect of core configuration
// XXX: current assumption, asking for timezone info
func (a *ClientAdapter) GetCoreConfig(keys []string) (map[string]interface{}, error) {
	var dt = time.Now()
	_, offset := dt.Zone()

	return map[string]interface{}{
		"Date":      dt.Format("2006-01-02"), // Format for picker
		"Time":      dt.Format("15:04"),      // Format for picker
		"Timezone":  float64(offset) / 60 / 60,
		"NTPServer": readNTPServer(),
	}, nil
}

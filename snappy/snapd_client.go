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
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"syscall"
	"time"

	"github.com/snapcore/snapd/client"
	"gopkg.in/ini.v1"
)

type NTPConfigurationFiles interface {
	GetDefaultConfFilename() string
}

type DefaultNTPConfigurationFiles struct{}

func (d *DefaultNTPConfigurationFiles) GetDefaultConfFilename() string {
	return "/etc/systemd/timesyncd.conf"
}

func NewDefaultNTPConfigurationFilesLocator() NTPConfigurationFiles {
	return &DefaultNTPConfigurationFiles{}
}

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
	GetModelInfo() (map[string]interface{}, error)
}

// Adapt our expectations to the snapd client API
type ClientAdapter struct {
	snapdClient *client.Client
}

func NewClientAdapter() *ClientAdapter {
	return &ClientAdapter{
		snapdClient: client.New(nil),
	}
}

func (a *ClientAdapter) Icon(name string) (*client.Icon, error) {
	return a.snapdClient.Icon(name)
}

func (a *ClientAdapter) Snap(name string) (*client.Snap, *client.ResultInfo, error) {
	return a.snapdClient.Snap(name)
}

func (a *ClientAdapter) List(names []string) ([]*client.Snap, error) {
	return a.snapdClient.List(names)
}

func (a *ClientAdapter) Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error) {
	return a.snapdClient.Find(opts)
}

func (a *ClientAdapter) Install(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Install(name, options)
}

func (a *ClientAdapter) Remove(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Remove(name, options)
}

func (a *ClientAdapter) ServerVersion() (*client.ServerVersion, error) {
	return a.snapdClient.ServerVersion()
}

// internal
func readNTPServer(c NTPConfigurationFiles) string {
	timesyncdPath := c.GetDefaultConfFilename()
	timesyncd, err := ini.Load(timesyncdPath)
	if err != nil {
		log.Println("readNTPServer: unable to read ", timesyncdPath)
		return ""
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		log.Println("readNTPServer: no NTP servers are set")
		return ""
	}

	// TODO: only the first one?
	return section.Key("NTP").Strings(" ")[0]
}

// Write back directly, rather than write-tmp(in same dir)+rename, as per the
// internals of ini package, although better, write accessible locations may
// not be on the same filesystem, removing the advantage.
//  : timeserver-control grants rw access to /etc/systemd/timesyncd.conf
func saveTimeSyncd(c NTPConfigurationFiles, confFile *ini.File) error {
	timesyncdPath := c.GetDefaultConfFilename()
	timesyncConf, err := os.OpenFile(timesyncdPath, os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		log.Println("saveTimeSyncd: Failed to open conf file: ", err)
		return err
	}

	defer timesyncConf.Close()

	w := bufio.NewWriter(timesyncConf)
	_, err = confFile.WriteTo(w)
	if err != nil {
		log.Println("saveTimeSyncd: Failed to write conf file: ", err)
		return err
	}
	w.Flush()
	return nil
}

func writeNTPServer(c NTPConfigurationFiles, ntpServer string) {
	timesyncdPath := c.GetDefaultConfFilename()
	log.Println(fmt.Sprintf("writeNTPServer: server=%s", ntpServer))
	timesyncd, err := ini.Load(timesyncdPath)
	if err != nil {
		log.Println("writeNTPServer: unable to update %v", timesyncdPath)
		return
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		log.Println("writeNTPServer: no NTP servers are set")
		return
	}

	ntpKey := section.Key("NTP")
	servers := ntpKey.Strings(" ")
	if servers[0] == ntpServer {
		log.Println("writeNTPServer: NTP server already set")
		return
	}

	servers = append([]string{ntpServer}, servers...)
	ntpKey.SetValue(strings.Join(servers, " "))

	saveTimeSyncd(c, timesyncd)
}

func (a *ClientAdapter) SetCoreConfig(patch map[string]interface{}) (string, error) {
	for k, v := range patch {
		fmt.Printf("%s=%v\n", k, v)
	}

	return "", nil
}

var defaultNTPConfigurationFileLocator = NewDefaultNTPConfigurationFilesLocator()

// XXX: current assumption, asking for timezone info
func (a *ClientAdapter) GetCoreConfig(keys []string) (map[string]interface{}, error) {
	var dt = time.Now()
	_, offset := dt.Zone()

	return map[string]interface{}{
		"Date":      dt.Format("2006-01-02"), // Format for picker
		"Time":      dt.Format("15:04"),      // Format for picker
		"Timezone":  float64(offset) / 60 / 60,
		"NTPServer": readNTPServer(defaultNTPConfigurationFileLocator),
	}, nil
}

func (a *ClientAdapter) GetModelInfo() (map[string]interface{}, error) {
	// Server version
	sysInfo, err := a.snapdClient.ServerVersion()
	if err != nil {
		return nil, err
	}

	// Interfaces
	ifaces, err := a.snapdClient.Interfaces()
	if err != nil {
		return nil, err
	}

	var allInterfaces []string
	for _, slot := range ifaces.Slots {
		allInterfaces = append(allInterfaces, slot.Name)
	}

	// Uptime
	var msi syscall.Sysinfo_t
	err = syscall.Sysinfo(&msi)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"DeviceName": "Device name",
		"Brand":      "Brand",
		"Model":      "Model",
		"Serial":     "Serial",
		"OS":         sysInfo.OSID + " " + sysInfo.Series,
		"Interfaces": allInterfaces,
		"Uptime":     time.Duration(msi.Uptime).String(),
	}, nil
}

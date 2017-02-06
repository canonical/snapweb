/*
 * Copyright (C) 2016-2017 Canonical Ltd
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

package snapdclient

import (
	"fmt"
	"log"
	"syscall"
	"time"

	"github.com/snapcore/snapd/asserts"
	"github.com/snapcore/snapd/client"
	"gopkg.in/ini.v1"
)

var timesyncdConfigurationFilePath = "/etc/systemd/timesyncd.conf"

// SnapdClient is a client of the snapd REST API
type SnapdClient interface {
	Icon(name string) (*client.Icon, error)
	Snap(name string) (*client.Snap, *client.ResultInfo, error)
	List(names []string, opts *client.ListOptions) ([]*client.Snap, error)
	Sections() ([]string, error)
	Find(opts *client.FindOptions) ([]*client.Snap, *client.ResultInfo, error)
	FindOne(name string) (*client.Snap, *client.ResultInfo, error)
	Install(name string, options *client.SnapOptions) (string, error)
	Remove(name string, options *client.SnapOptions) (string, error)
	ServerVersion() (*client.ServerVersion, error)
	CreateUser(request *client.CreateUserOptions) (*client.CreateUserResult, error)
	Interfaces() (client.Interfaces, error)
	Known(assertTypeName string, headers map[string]string) ([]asserts.Assertion, error)
	Change(id string) (*client.Change, error)
	Enable(id string, options *client.SnapOptions) (string, error)
	Disable(id string, options *client.SnapOptions) (string, error)
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
func (a *ClientAdapter) List(names []string, opts *client.ListOptions) ([]*client.Snap, error) {
	return a.snapdClient.List(names, opts)
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

// Interfaces returns the list of supported interfaces on the system
func (a *ClientAdapter) Interfaces() (client.Interfaces, error) {
	return a.snapdClient.Interfaces()
}

// Known queries assertions with type assertTypeName and matching assertion headers.
func (a *ClientAdapter) Known(assertTypeName string, headers map[string]string) ([]asserts.Assertion, error) {
	return a.snapdClient.Known(assertTypeName, headers)
}

// FindOne returns a list of snaps available for install from the
// store for this system and that match the query
func (a *ClientAdapter) FindOne(name string) (*client.Snap, *client.ResultInfo, error) {
	return a.snapdClient.FindOne(name)
}

// Sections returns the list of available sections
func (a *ClientAdapter) Sections() ([]string, error) {
	return a.snapdClient.Sections()
}

// Change returns the list of ongoing changes for a given snap and changeid
func (a *ClientAdapter) Change(id string) (*client.Change, error) {
	return a.snapdClient.Change(id)
}

// Enable enables the snap
func (a *ClientAdapter) Enable(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Enable(name, options)
}

// Disable disables the snap
func (a *ClientAdapter) Disable(name string, options *client.SnapOptions) (string, error) {
	return a.snapdClient.Disable(name, options)
}

// internal
func readNTPServer() string {
	timesyncd, err := ini.Load(timesyncdConfigurationFilePath)
	if err != nil {
		log.Println("readNTPServer: unable to read ",
			timesyncdConfigurationFilePath)
		return ""
	}

	section, err := timesyncd.GetSection("Time")
	if err != nil || !section.HasKey("NTP") {
		log.Println("readNTPServer: no NTP servers are set ",
			timesyncdConfigurationFilePath)
		return ""
	}

	return section.Key("NTP").Strings(" ")[0]
}

// GetCoreConfig gets some aspect of core configuration
// XXX: current assumption, asking for timezone info
func GetCoreConfig(keys []string) (map[string]interface{}, error) {
	var dt = time.Now()
	_, offset := dt.Zone()

	return map[string]interface{}{
		"Date":      dt.Format("2006-01-02"), // Format for picker
		"Time":      dt.Format("15:04"),      // Format for picker
		"Timezone":  float64(offset) / 60 / 60,
		"NTPServer": readNTPServer(),
	}, nil
}

// GetModelInfo returns information about the device.
func GetModelInfo(c SnapdClient) (map[string]interface{}, error) {
	// Server version
	sysInfo, err := c.ServerVersion()
	if err != nil {
		return nil, err
	}

	// Interfaces
	ifaces, err := c.Interfaces()
	if err != nil {
		return nil, err
	}

	var allInterfaces []string
	for _, slot := range ifaces.Slots {
		allInterfaces = append(allInterfaces, slot.Name)
	}

	deviceName := "Device Name"

	// Model Info
	brandName := "Unknown"
	modelName := "Unknown"
	serialNumber := "Unknown"

	serialInfo, err := c.Known("serial", map[string]string{})
	if err == nil {
		if len(serialInfo) == 0 {
			log.Println("GetModelInfo: No assertions returned for serial type")
		} else {
			brandName = serialInfo[0].Header("brand-id").(string)
			modelName = serialInfo[0].Header("model").(string)
			serialNumber = serialInfo[0].Header("serial").(string)
		}
	} else {
		log.Println(fmt.Sprintf("GetModelInfo: No serial type info found: %s", err))
	}

	// Uptime
	var msi syscall.Sysinfo_t
	err = syscall.Sysinfo(&msi)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"DeviceName": deviceName,
		"Brand":      brandName,
		"Model":      modelName,
		"Serial":     serialNumber,
		"OS":         sysInfo.OSID + " " + sysInfo.Series,
		"Interfaces": allInterfaces,
		"Uptime":     (time.Duration(msi.Uptime) * time.Second).String(),
	}, nil
}

// CreateUser creates a local user on the system
func (a *ClientAdapter) CreateUser(request *client.CreateUserOptions) (*client.CreateUserResult, error) {
	return a.snapdClient.CreateUser(request)
}

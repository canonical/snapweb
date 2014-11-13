/*
 Copyright 2014 Canonical Ltd.

 This program is free software: you can redistribute it and/or modify it
 under the terms of the GNU General Public License version 3, as published
 by the Free Software Foundation.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranties of
 MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR
 PURPOSE.  See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along
 with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Package click exposes some utilities related to click packages and
// wraps libclick to check if packages are installed.
package click

import (
	"encoding/json"
	"errors"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"launchpad.net/go-xdg/v0"

	"launchpad.net/ubuntu-push/click/cappinfo"
	"launchpad.net/ubuntu-push/click/cclick"
)

// AppId holds a parsed application id.
type AppId struct {
	Package     string
	Application string
	Version     string
	Click       bool
	original    string
}

// from https://wiki.ubuntu.com/AppStore/Interfaces/ApplicationId
// except the version is made optional
var rxClick = regexp.MustCompile(`^([a-z0-9][a-z0-9+.-]+)_([a-zA-Z0-9+.-]+)(?:_([0-9][a-zA-Z0-9.+:~-]*))?$`)

// no / and not starting with .
var rxLegacy = regexp.MustCompile(`^[^./][^/]*$`)

var (
	ErrInvalidAppId = errors.New("invalid application id")
	ErrMissingApp   = errors.New("application not installed")
)

func ParseAppId(id string) (*AppId, error) {
	app := new(AppId)
	err := app.setFromString(id)
	if err == nil {
		return app, nil
	} else {
		return nil, err
	}
}

func (app *AppId) setFromString(id string) error {
	if strings.HasPrefix(id, "_") { // legacy
		appname := id[1:]
		if !rxLegacy.MatchString(appname) {
			return ErrInvalidAppId
		}
		app.Package = ""
		app.Application = appname
		app.Version = ""
		app.Click = false
		app.original = id
		return nil
	} else {
		m := rxClick.FindStringSubmatch(id)
		if len(m) == 0 {
			return ErrInvalidAppId
		}
		app.Package = m[1]
		app.Application = m[2]
		app.Version = m[3]
		app.Click = true
		app.original = id
		return nil
	}
}

func (app *AppId) InPackage(pkgname string) bool {
	return app.Package == pkgname
}

func (app *AppId) DispatchPackage() string {
	if app.Click {
		return app.Package
	}
	return app.Application
}

func (app *AppId) Original() string {
	return app.original
}

func (app *AppId) String() string {
	return app.Original()
}

func (app *AppId) Base() string {
	if app.Click {
		return app.Package + "_" + app.Application
	} else {
		return app.Application
	}
}

func (app *AppId) Versioned() string {
	if app.Click {
		if app.Version == "" {
			panic(fmt.Errorf("Versioned() on AppId without version/not verified: %#v", app))
		}
		return app.Package + "_" + app.Application + "_" + app.Version
	} else {
		return app.Application
	}
}

func (app *AppId) DesktopId() string {
	return app.Versioned() + ".desktop"
}

func (app *AppId) Icon() string {
	return cappinfo.AppIconFromDesktopId(app.DesktopId())
}

func _symbolic(icon string) string {
	if strings.ContainsRune(icon, '/') {
		return icon
	}
	return icon + "-symbolic"
}

var symbolic = _symbolic

func (app *AppId) SymbolicIcon() string {
	symbolicIcon := cappinfo.AppSymbolicIconFromDesktopId(app.DesktopId())
	if symbolicIcon != "" {
		return symbolicIcon
	}
	return symbolic(app.Icon())
}

func (app *AppId) MarshalJSON() ([]byte, error) {
	return json.Marshal(app.Original())
}

func (app *AppId) UnmarshalJSON(s []byte) error {
	var v string
	err := json.Unmarshal(s, &v)
	if err != nil {
		return err
	}
	return app.setFromString(v)
}

// ClickUser exposes the click package registry for the user.
type ClickUser struct {
	ccu  cclick.CClickUser
	lock sync.Mutex
}

type InstalledChecker interface {
	Installed(app *AppId, setVersion bool) bool
}

// ParseAndVerifyAppId parses the given app id and checks if the
// corresponding app is installed, returning the parsed id or
// ErrInvalidAppId, or the parsed id and ErrMissingApp respectively.
func ParseAndVerifyAppId(id string, installedChecker InstalledChecker) (*AppId, error) {
	app, err := ParseAppId(id)
	if err != nil {
		return nil, err
	}
	if installedChecker != nil && !installedChecker.Installed(app, true) {
		return app, ErrMissingApp
	}
	return app, nil
}

// User makes a new ClickUser object for the current user.
func User() (*ClickUser, error) {
	cu := new(ClickUser)
	err := cu.ccu.CInit(cu)
	if err != nil {
		return nil, err
	}
	return cu, nil
}

// Installed checks if the appId is installed for user, optionally setting
// the version if it was absent.
func (cu *ClickUser) Installed(app *AppId, setVersion bool) bool {
	cu.lock.Lock()
	defer cu.lock.Unlock()
	if app.Click {
		ver := cu.ccu.CGetVersion(app.Package)
		if ver == "" {
			return false
		}
		if app.Version != "" {
			return app.Version == ver
		} else if setVersion {
			app.Version = ver
		}
		return true
	} else {
		_, err := xdg.Data.Find(filepath.Join("applications", app.DesktopId()))
		return err == nil
	}
}

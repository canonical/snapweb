/*
 * Copyright (C) 2014-2015 Canonical Ltd
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

package oem

import (
	"errors"
	"io/ioutil"
	"path/filepath"

	"launchpad.net/snappy/snappy"

	"gopkg.in/yaml.v2"
)

// Snap holds the package.yaml for a snappy.SnapTypeOem package.
type Snap struct {
	Name     string `yaml:"name" json:"name"`
	Vendor   string `yaml:"vendor" json:"vendor"`
	Icon     string `yaml:"icon" json:"icon"`
	Version  string `yaml:"version" json:"version"`
	Type     string `yaml:"type" json:"type"`
	Branding struct {
		Name    string `yaml:"name" json:"name"`
		Subname string `yaml:"subname" json:"subname"`
	} `yaml:"branding" json:"branding"`
	Store struct {
		OemKey string `yaml:"oem-key" json:"oem-key"`
	} `yaml:"store" json:"store"`
}

// ErrNotFound indicates that there is no oem package.
var ErrNotFound = errors.New("no oem package installed")

// ErrTooMany indicates that there are too many active snappy.SnapTypeOem packages, which
// should never happen on a snappy managed system.
var ErrTooMany = errors.New("too many oem packages found")

// ErrDecode indicates that there has been an issue while decoding the contents of the
// oem package.
var ErrDecode = errors.New("decoding problem")

// Oem returns an oem package
func Oem() (*Snap, error) {
	oem, err := snappy.ActiveSnapsByType(snappy.SnapTypeOem)
	if err != nil {
		return nil, err
	} else if len(oem) > 1 {
		return nil, ErrTooMany
	} else if len(oem) == 0 {
		return nil, ErrNotFound
	}

	yamlPath := filepath.Join("/oem", oem[0].Name(), oem[0].Version(), "meta", "package.yaml")
	f, err := ioutil.ReadFile(yamlPath)
	if err != nil {
		return nil, ErrDecode
	}

	var pkg Snap
	if err := yaml.Unmarshal([]byte(f), &pkg); err != nil {
		return nil, ErrDecode
	}

	return &pkg, nil
}

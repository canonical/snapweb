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

package gadget

import (
	"errors"
	"io/ioutil"
	"path/filepath"

	"github.com/ubuntu-core/snappy/snap"
	"github.com/ubuntu-core/snappy/snappy"

	"gopkg.in/yaml.v2"
)

// Snap holds the package.yaml for a snap.TypeGadget package.
type Snap struct {
	Name     string `yaml:"name" json:"name"`
	Icon     string `yaml:"icon" json:"icon"`
	Version  string `yaml:"version" json:"version"`
	Type     string `yaml:"type" json:"type"`
	Branding struct {
		Name    string `yaml:"name" json:"name"`
		Subname string `yaml:"subname" json:"subname"`
	} `yaml:"branding" json:"branding"`
	Store struct {
		ID string `yaml:"id" json:"id"`
	} `yaml:"store" json:"store"`
}

// ErrNotFound indicates that there is no gadget package.
var ErrNotFound = errors.New("no gadget package installed")

// ErrTooMany indicates that there are too many active snap.TypeGadget packages, which
// should never happen on a snappy managed system.
var ErrTooMany = errors.New("too many gadget packages found")

// ErrDecode indicates that there has been an issue while decoding the contents of the
// gadget package.
var ErrDecode = errors.New("decoding problem")

// Gadget returns an gadget package
func Gadget() (*Snap, error) {
	gadget, err := snappy.ActiveSnapsByType(snap.TypeGadget)
	if err != nil {
		return nil, err
	} else if len(gadget) > 1 {
		return nil, ErrTooMany
	} else if len(gadget) == 0 {
		return nil, ErrNotFound
	}

	yamlPath := filepath.Join("/snaps", gadget[0].Name(), gadget[0].Version(), "meta", "snap.yaml")
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

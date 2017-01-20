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

package snappy

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/snapcore/snapweb/snappy/snapdclient"
)

var (
	// ErrDataPathNotSet indicates that SNAP_DATA has not been set by the
	// launching system.
	ErrDataPathNotSet = errors.New("package data path not set")
	// ErrOnIconDataPathSet indicates that there has been an error when setting up
	// the location where icons are going to be saved.
	ErrOnIconDataPathSet = errors.New("cannot prepare icon data path")
	// ErrIconNotExist happens when the package has no icon.
	ErrIconNotExist = errors.New("the icon does not exist")
)

// TODO there is a lot of dup work there since
// we do snapd requests everytime even for icons
// that we got already (just to get the name, we should
// locally cache it)
func localIconPath(c snapdclient.SnapdClient, name string) (relativePath string, err error) {
	dataPath, relativePath, err := IconDir()
	if err != nil {
		return "", err
	}

	icon, err := c.Icon(name)
	if err != nil {
		return err.Error(), ErrIconNotExist
	}

	// TODO escape names?
	baseIcon := fmt.Sprintf("%s_%s", name, icon.Filename)

	relativePath = filepath.Join(relativePath, baseIcon)
	iconDstPath := filepath.Join(dataPath, baseIcon)

	// if we already have the icon, return
	if _, err := os.Stat(iconDstPath); err == nil {
		return filepath.Join("/", relativePath), nil
	}

	err = ioutil.WriteFile(iconDstPath, icon.Content, 0644)
	if err != nil {
		return "", err
	}

	return filepath.Join("/", relativePath), nil
}

// IconDir returns information to properly serve package icons with an http.FileServer
func IconDir() (dataPath, relativeBasePath string, err error) {
	dataPath = os.Getenv("SNAP_DATA")
	if dataPath == "" {
		return "", "", ErrDataPathNotSet
	}

	dataPath = filepath.Join(dataPath, "icons")
	if err := os.MkdirAll(dataPath, 0755); err != nil {
		fmt.Println("WARNING: cannot create", dataPath)
		return "", "", ErrOnIconDataPathSet
	}

	return dataPath, "icons", nil
}

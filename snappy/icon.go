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

package snappy

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

var (
	// ErrDataPathNotSet indicates that SNAP_APP_DATA_PATH has not been set by the
	// launching system.
	ErrDataPathNotSet = errors.New("package data path not set")
	// ErrOnIconDataPathSet indicates that there has been an error when setting up
	// the location where icons are going to be saved.
	ErrOnIconDataPathSet = errors.New("cannot prepare icon data path")
	// ErrIconNotExist happens when the package has no icon.
	ErrIconNotExist = errors.New("the icon does not exist")
)

func localIconPath(pkgName, iconPath string) (relativePath string, err error) {
	dataPath, relativePath, err := IconDir()
	if err != nil {
		return "", err
	}

	baseIcon := fmt.Sprintf("%s_%s", pkgName, filepath.Base(iconPath))

	relativePath = filepath.Join(relativePath, baseIcon)
	iconDstPath := filepath.Join(dataPath, baseIcon)

	// if the icon specified is bad, return
	if _, err := os.Stat(iconPath); os.IsNotExist(err) {
		return "", ErrIconNotExist
	}

	// if we already have the icon, return
	if _, err := os.Stat(iconDstPath); err == nil {
		return filepath.Join("/", relativePath), nil
	} else if !os.IsNotExist(err) {
		return "", err
	}

	if err := copyFile(iconPath, iconDstPath); err != nil {
		return "", err
	}

	return filepath.Join("/", relativePath), nil
}

// IconDir returns information to properly serve package icons with an http.FileServer
func IconDir() (dataPath, relativeBasePath string, err error) {
	dataPath = os.Getenv("SNAP_APP_DATA_PATH")
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

func copyFile(src, dst string) error {
	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	reader := bufio.NewReader(srcFile)
	writer := bufio.NewWriter(dstFile)
	defer func() {
		if err != nil {
			writer.Flush()
		}
	}()
	if _, err = io.Copy(writer, reader); err != nil {
		return err
	}
	writer.Flush()
	return nil
}

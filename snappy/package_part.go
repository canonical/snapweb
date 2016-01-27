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
	"time"

	"github.com/ubuntu-core/snappy/client"
	"github.com/ubuntu-core/snappy/progress"
	"github.com/ubuntu-core/snappy/snap"
	"github.com/ubuntu-core/snappy/snappy"
)

// packagePart is an interim bridge between client.Package and snappy.Part.
type packagePart struct {
	client.Package
}

var _ snappy.Part = (*packagePart)(nil)

func (p packagePart) Name() string {
	return p.Package.Name
}

func (p packagePart) Version() string {
	return p.Package.Version
}

func (p packagePart) Origin() string {
	return p.Package.Origin
}

func (p packagePart) Description() string {
	return p.Package.Description
}

func (p packagePart) InstalledSize() int64 {
	return p.Package.InstalledSize
}

func (p packagePart) DownloadSize() int64 {
	return p.Package.DownloadSize
}

func (p packagePart) Icon() string {
	return p.Package.Icon
}

func (p packagePart) IsInstalled() bool {
	return p.Status == client.StatusInstalled || p.Status == client.StatusActive
}

func (p packagePart) IsActive() bool {
	return p.Status == client.StatusActive
}

func (p packagePart) Type() snap.Type {
	return snap.Type(p.Package.Type)
}

func (p packagePart) Hash() string {
	return ""
}

func (p packagePart) Channel() string {
	return ""
}

func (p packagePart) NeedsReboot() bool {
	return false
}

func (p packagePart) Config(configuration []byte) (newConfig string, err error) {
	return "", nil
}

func (p packagePart) Date() time.Time {
	return time.Now()
}

func (p packagePart) Install(pb progress.Meter, flags snappy.InstallFlags) (name string, err error) {
	return "", nil
}

func (p packagePart) Uninstall(pb progress.Meter) error {
	return nil
}

func (p packagePart) SetActive(bool, progress.Meter) error {
	return nil
}

func (p packagePart) Frameworks() ([]string, error) {
	return nil, nil
}

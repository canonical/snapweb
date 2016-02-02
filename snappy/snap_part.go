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

// snapPart is an interim bridge between client.Snap and snappy.Part.
type snapPart struct {
	client.Snap
}

var _ snappy.Part = (*snapPart)(nil)

func (p snapPart) Name() string {
	return p.Snap.Name
}

func (p snapPart) Version() string {
	return p.Snap.Version
}

func (p snapPart) Origin() string {
	return p.Snap.Origin
}

func (p snapPart) Description() string {
	return p.Snap.Description
}

func (p snapPart) InstalledSize() int64 {
	return p.Snap.InstalledSize
}

func (p snapPart) DownloadSize() int64 {
	return p.Snap.DownloadSize
}

func (p snapPart) Icon() string {
	return p.Snap.Icon
}

func (p snapPart) IsInstalled() bool {
	return p.Status == client.StatusInstalled || p.Status == client.StatusActive
}

func (p snapPart) IsActive() bool {
	return p.Status == client.StatusActive
}

func (p snapPart) Type() snap.Type {
	return snap.Type(p.Snap.Type)
}

func (p snapPart) Hash() string {
	return ""
}

func (p snapPart) Channel() string {
	return ""
}

func (p snapPart) NeedsReboot() bool {
	return false
}

func (p snapPart) Config(configuration []byte) (newConfig string, err error) {
	return "", nil
}

func (p snapPart) Date() time.Time {
	return time.Now()
}

func (p snapPart) Install(pb progress.Meter, flags snappy.InstallFlags) (name string, err error) {
	return "", nil
}

func (p snapPart) Uninstall(pb progress.Meter) error {
	return nil
}

func (p snapPart) SetActive(bool, progress.Meter) error {
	return nil
}

func (p snapPart) Frameworks() ([]string, error) {
	return nil, nil
}

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
	"github.com/ubuntu-core/snappy/client"
)

type snapdClient interface {
	Icon(pkgID string) (*client.Icon, error)
	Snap(name string) (*client.Snap, *client.ResultInfo, error)
	FilterSnaps(filter client.SnapFilter) ([]*client.Snap, *client.ResultInfo, error)
	AddSnap(name string) (string, error)
	RemoveSnap(name string) (string, error)
}

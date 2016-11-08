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

package main

import (
	"io/ioutil"
	"os"
	"path/filepath"

	. "gopkg.in/check.v1"
)

type CertSuite struct{}

var _ = Suite(&CertSuite{})

func (s *CertSuite) TestGenerate(c *C) {
	tmp := c.MkDir()
	os.Setenv("SNAP_DATA", tmp)
	certFile := filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
	keyFile := filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")

	c.Assert(ioutil.WriteFile(certFile, nil, 0600), IsNil)
	c.Assert(ioutil.WriteFile(keyFile, nil, 0600), IsNil)

	GenerateCertificate()
	_, err := ioutil.ReadFile(certFile)
	c.Assert(err, IsNil)
	_, err = ioutil.ReadFile(keyFile)
	c.Assert(err, IsNil)
}

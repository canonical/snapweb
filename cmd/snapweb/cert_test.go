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

type CertSuite struct {
	snapdata     string
	certFilename string
	keyFilename  string
}

var _ = Suite(&CertSuite{})

func (s *CertSuite) SetUpTest(c *C) {
	s.snapdata = c.MkDir()
	os.Setenv("SNAP_DATA", s.snapdata)

	s.certFilename = filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
	s.keyFilename = filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")
}

func (s *CertSuite) TearDownTest(c *C) {
	os.RemoveAll(s.snapdata)
}

func (s *CertSuite) TestCreateCertificateIfNeeded(c *C) {
	c.Assert(ioutil.WriteFile(s.certFilename, nil, 0600), IsNil)
	c.Assert(ioutil.WriteFile(s.keyFilename, nil, 0600), IsNil)

	CreateCertificateIfNeeded()
	certData, err := ioutil.ReadFile(s.certFilename)
	c.Assert(err, IsNil)
	keyData, err := ioutil.ReadFile(s.keyFilename)
	c.Assert(err, IsNil)

	CreateCertificateIfNeeded()
	certData2, err := ioutil.ReadFile(s.certFilename)
	c.Assert(err, IsNil)
	keyData2, err := ioutil.ReadFile(s.keyFilename)
	c.Assert(err, IsNil)

	// ensure the certificate is not re-generated if one already exists
	c.Assert(certData, DeepEquals, certData2)
	c.Assert(keyData, DeepEquals, keyData2)
}

func (s *CertSuite) TestGenerateCertificate(c *C) {
	GenerateCertificate(s.certFilename, s.keyFilename)
	_, err := os.Stat(s.certFilename)
	c.Assert(err, IsNil)
	_, err = os.Stat(s.keyFilename)
	c.Assert(err, IsNil)
	// TODO check for content
	c.Assert(createPublicKeycertFile(s.certFilename, nil), IsNil)
	c.Assert(createPrivateKeyFile(s.keyFilename, nil), NotNil)
}

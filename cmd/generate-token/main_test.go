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
	"testing"

	. "gopkg.in/check.v1"
)

func Test(t *testing.T) { TestingT(t) }

type GenerateTokenSuite struct {
}

var _ = Suite(&GenerateTokenSuite{})

func (s *GenerateTokenSuite) SetUpTest(c *C) {
	os.Setenv("SNAP_DATA", c.MkDir())
}

func (s *GenerateTokenSuite) TestCreateDifferentTokens(c *C) {
	token1 := generateToken(64)
	c.Assert(len(token1), Equals, 64)
	for i := 0; i < 100000; i++ {
		token2 := generateToken(64)
		c.Assert(token1, Not(Equals), token2)
	}
}

func (s *GenerateTokenSuite) TestSaveToken(c *C) {
	token := saveToken()
	t, err := ioutil.ReadFile(tokenFilename())
	c.Assert(err, IsNil)
	c.Assert(string(t), Equals, token)
	c.Assert(len(string(t)), Equals, 64)
}

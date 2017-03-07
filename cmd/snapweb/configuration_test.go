/*
 * Copyright (C) 2017 Canonical Ltd
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
	"encoding/json"
	"errors"
	"io/ioutil"
	"os"
	"path/filepath"

	. "gopkg.in/check.v1"
)

func setupConfigWithContent(c *C, snapCommonPath string, content []byte) {
	configPath := filepath.Join(snapCommonPath, configFilename)
	c.Assert(ioutil.WriteFile(configPath, []byte(content), 0644), IsNil)
}

func setupConfig(c *C, snapCommonPath string, config Config) {
	content, err := json.Marshal(config)
	c.Assert(err, IsNil)
	setupConfigWithContent(c, snapCommonPath, content)
}

type ConfigurationSuite struct {
	snapCommonEnv string
}

var _ = Suite(&ConfigurationSuite{})

func (s *ConfigurationSuite) SetUpTest(c *C) {
	s.snapCommonEnv = c.MkDir()
	os.Setenv("SNAP_COMMON", s.snapCommonEnv)
}

func (s *ConfigurationSuite) TestNonExistentConfigurationFile(c *C) {
	c.Check(readConfig(), DeepEquals, Config{DisableAccessToken: false, DisableHTTPS: false})
}

func (s *ConfigurationSuite) TestExistingInvalidSetupFile(c *C) {
	setupConfigWithContent(c, s.snapCommonEnv, []byte("Invalid json"))
	c.Check(readConfig(), DeepEquals, Config{DisableAccessToken: false, DisableHTTPS: false})
}

func (s *ConfigurationSuite) TestExistingValidSetupFile(c *C) {
	conf := Config{DisableAccessToken: true, DisableHTTPS: true}
	setupConfig(c, s.snapCommonEnv, conf)
	c.Check(readConfig(), DeepEquals, Config{DisableAccessToken: true, DisableHTTPS: true})
}

func (s *ConfigurationSuite) TestErrorWhileReadingFile(c *C) {
	conf := Config{DisableAccessToken: true, DisableHTTPS: true}
	setupConfig(c, s.snapCommonEnv, conf)
	readFile = func(filename string) ([]byte, error) {
		return nil, errors.New("error")
	}
	c.Check(readConfig(), DeepEquals, Config{})
	readFile = ioutil.ReadFile
}

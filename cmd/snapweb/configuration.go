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
	"io/ioutil"
	"os"
	"path/filepath"
)

const (
	configFilename string = "settings.json"
)

type Config struct {
	DisableTokenCheck bool `json:"disableTokenCheck,omitempty"`
	DisableHttps      bool `json:"disableHttps,omitempty"`
}

func readConfig() Config {
	configFilepath := filepath.Join(os.Getenv("SNAP_COMMON"), configFilename)
	if _, err := os.Stat(configFilepath); err != nil {
		return Config{}
	}

	var err error
	var content []byte
	if content, err = ioutil.ReadFile(configFilepath); err != nil {
		return Config{}
	}

	var config Config
	err = json.Unmarshal(content, &config)
	if err != nil {
		logger.Println("Invalid configuration file %s: %s",
			configFilepath,
			err.Error())
		return Config{}
	}

	return config
}

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
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

const (
	configFilename string = "settings.json"
)

// Config described the runtime configuration
type Config struct {
	DisableAccessToken bool `json:"disableAccessToken,omitempty"`
	DisableHTTPS       bool `json:"disableHttps,omitempty"`
}

var osStat = os.Stat

var getSnapConfigurationLocations = func() ([]string, error) {
	candidateLocations := []string{
		filepath.Join(os.Getenv("SNAP_COMMON"), configFilename),
		filepath.Join(os.Getenv("SNAP"), configFilename),
	}
	var validLocations []string
	for _, l := range candidateLocations {
		if _, err := osStat(l); err == nil {
			validLocations = append(validLocations, l)
		}
	}
	return validLocations, nil
}

var readFile = ioutil.ReadFile

func readConfig() Config {
	locations, err := getSnapConfigurationLocations()
	if err != nil || len(locations) == 0 {
		return Config{}
	}

	var config Config
	for _, l := range locations {
		var content []byte
		if content, err = readFile(l); err != nil {
			continue
		}
		err := json.Unmarshal(content, &config)
		if err != nil {
			logger.Println(
				fmt.Sprintf("Invalid configuration file %s: %s",
					l, err.Error()))
			continue
		}
	}
	return config
}

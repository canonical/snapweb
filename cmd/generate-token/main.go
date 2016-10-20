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
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"time"
)

var logger *log.Logger

var shorHelp = "Creates an accesss token for using Snapweb on this system"

var longHelp = `
The generate-token command creates a new access token, to confirm that you are an authorized administrator of this system.

The access token will be requested the first time you try to access the Snapweb interface.

If the token expired or became invalid, you can use the command again to generate a new one.
`

func tokenFilename() string {
	return filepath.Join(os.Getenv("SNAP_DATA"), "token.txt")
}

// checkUser verifies that the user running the command is administrator
func checkUser() {
	if os.Geteuid() != 0 {
		fmt.Println("You need administrator privileges to run this command. Use:\n\nsudo snapweb.generate-token")
		os.Exit(1)
	}
}

// writeToken saves the token for later comparison by the snapweb token handler
func writeToken(token string) {
	targetFile := tokenFilename()
	err := ioutil.WriteFile(targetFile, []byte(token), 0600)
	if err != nil {
		logger.Fatal(err)
	}
}

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func generateToken(n int) string {
	rand.Seed(time.Now().UnixNano())

	b := make([]byte, n)
	for i := range b {
		b[i] = alphabet[rand.Intn(len(alphabet))]
	}
	return string(b)
}

func main() {
	logger = log.New(os.Stderr, "generate-token: ", log.Ldate|log.Ltime|log.Lshortfile)

	checkUser()

	token := generateToken(64)

	writeToken(token)

	fmt.Printf("Snapweb Access Token:\n\n%s\n\n", token)
	fmt.Printf("Use the above token in the Snapweb interface to be granted access.\n")
}

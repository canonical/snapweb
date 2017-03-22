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

/* This module gathers a set of helper functions and structures shared
   by the various commands in snapweb
*/

package snappy

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/snapcore/snapd/client"
)

// IsDeviceManaged determines if the device is in the 'managed' state
func IsDeviceManaged() bool {
	client := client.New(nil)

	sysInfo, err := client.SysInfo()
	if err != nil {
		return false
	}

	if sysInfo.OnClassic || sysInfo.Managed {
		return true
	}

	return false
}

func unixDialer(socketPath string) func(string, string) (net.Conn, error) {
	file, err := os.OpenFile(socketPath, os.O_RDWR, 0666)
	if err == nil {
		file.Close()
	}

	return func(_, _ string) (net.Conn, error) {
		return net.Dial("unix", socketPath)
	}
}

// MakePassthroughHandler maps a snapd API to a snapweb HTTP handler
func MakePassthroughHandler(socketPath string, prefix string) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := &http.Client{
			Transport: &http.Transport{Dial: unixDialer(socketPath)},
		}

		log.Println(r.Method, r.URL.Path)

		// need to remove the RequestURI field
		// and remove the /api prefix from snapweb URLs
		r.URL.Scheme = "http"
		r.URL.Host = "localhost"
		r.URL.Path = strings.TrimPrefix(r.URL.Path, prefix)

		outreq, err := http.NewRequest(r.Method, r.URL.String(), r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		resp, err := c.Do(outreq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Note: the client.Do method above only returns JSON responses
		//       even if it doesn't say so
		hdr := w.Header()
		hdr.Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)

		io.Copy(w, resp.Body)

	})
}

// LoggingHandler adds HTTP logs to a handler
func LoggingHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

// WritePidFile writes the PID of the current process to snapweb.pid
func WritePidFile() {
	var err error

	pidFilePath := filepath.Join(os.Getenv("SNAP_DATA"), "snapweb.pid")

	if f, err := os.OpenFile(pidFilePath, os.O_CREATE|os.O_RDWR, os.ModeTemporary|0640); err == nil {
		fmt.Fprintf(f, "%d\n", os.Getpid())
	}
	if err != nil {
		log.Println(err)
	}

}

// WaitForSigHup waits for the reception of the SIGHUP signal
func WaitForSigHup() {
	var sigchan chan os.Signal
	sigchan = make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGHUP)
	defer signal.Stop(sigchan)
	<-sigchan
}

// SendSignalToSnapweb informs snapweb that the webconf process is finished, via a SIGHUP signal
func SendSignalToSnapweb() {
	var pid int

	pidFilePath := filepath.Join(os.Getenv("SNAP_DATA"), "snapweb.pid")

	if f, err := os.Open(pidFilePath); err == nil {
		if _, err = fmt.Fscanf(f, "%d\n", &pid); err == nil {
			p, _ := os.FindProcess(pid)
			err = p.Signal(syscall.Signal(syscall.SIGHUP))
		} else {
			log.Println(err)
		}
	} else {
		log.Println(err)
	}
}

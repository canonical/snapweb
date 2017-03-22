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
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"testing"

	. "gopkg.in/check.v1"

	"github.com/snapcore/snapweb/snappy/app"
)

func Test(t *testing.T) { TestingT(t) }

type WebconfSuite struct{}

var _ = Suite(&WebconfSuite{})

func (s *WebconfSuite) SetUpTest(c *C) {
	cwd, err := os.Getwd()
	c.Assert(err, IsNil)
	os.Setenv("SNAP", filepath.Join(cwd, "..", ".."))
}

func (s *WebconfSuite) TestURLHandlers(c *C) {
	handler := initURLHandlers(log.New(os.Stdout, "", 0), nil)
	defer func() {
		http.DefaultServeMux = http.NewServeMux()
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/", nil)
	req.RemoteAddr = "127.0.0.1:80"
	c.Assert(err, IsNil)

	handler.ServeHTTP(rec, req)
	c.Assert(rec.Code, Equals, http.StatusOK)

	body := rec.Body.String()
	c.Check(strings.Contains(body, "'Ubuntu'"), Equals, true)
}

func (s *WebconfSuite) TestDoneHandler(c *C) {
	tmp := c.MkDir()
	os.Setenv("SNAP_DATA", tmp)
	snappy.WritePidFile()

	done := false
	var sigchan chan os.Signal
	sigchan = make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGHUP)

	server, _ := net.Listen("tcp", httpAddr)
	handler := doneHandler(server)

	req, _ := http.NewRequest("GET", "/done", nil)
	req.RemoteAddr = "127.0.0.1:80"
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	select {
	case <-sigchan:
		done = true
	}

	c.Assert(done, Equals, true)
}

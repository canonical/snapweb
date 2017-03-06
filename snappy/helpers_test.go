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
	"bytes"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	. "gopkg.in/check.v1"

	"github.com/snapcore/snapweb/snappy/app"
)

func Test(t *testing.T) { TestingT(t) }

type HandlersSuite struct {
	c *snappy.FakeSnapdClient
}

var _ = Suite(&HandlersSuite{})

func (s *HandlersSuite) SetUpTest(c *C) {
	s.c = &snappy.FakeSnapdClient{}

	s.c.Version.Version = "1000"
	s.c.Version.Series = "16"

	s.c.Err = nil
}

func (s *HandlersSuite) TearDownTest(c *C) {
}

func (s *HandlersSuite) TestLoggingHandler(c *C) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	logged := LoggingHandler(handler)

	var output bytes.Buffer
	log.SetOutput(&output)
	defer func() {
		log.SetOutput(os.Stdout)
	}()

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/foo", nil)
	c.Assert(err, IsNil)

	logged.ServeHTTP(rec, req)

	c.Assert(output.String(), Matches, ".*GET /foo\n")
}

func (s *HandlersSuite) TestPassthroughHandler(c *C) {
	socketPath := "/tmp/snapd-test.socket"
	c.Assert(os.MkdirAll(filepath.Dir(socketPath), 0755), IsNil)
	l, err := net.Listen("unix", socketPath)
	if err != nil {
		c.Fatalf("unable to listen on %q: %v", socketPath, err)
	}

	f := func(w http.ResponseWriter, r *http.Request) {
		c.Check(r.URL.Path, Equals, "/v2/system-info")
		c.Check(r.URL.RawQuery, Equals, "")

		fmt.Fprintln(w, `{"type":"sync", "result":{"series":"42"}}`)
	}

	srv := &httptest.Server{
		Listener: l,
		Config:   &http.Server{Handler: http.HandlerFunc(f)},
	}
	srv.Start()
	defer srv.Close()

	handler := http.HandlerFunc(MakePassthroughHandler(socketPath, "/api"))

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/api/v2/system-info", nil)
	c.Assert(err, IsNil)

	// req.AddCookie(&http.Cookie{Name: SnapwebCookieName, Value: "1234"})

	handler(rec, req)
	body := rec.Body.String()
	c.Assert(rec.Code, Equals, http.StatusOK)
	c.Check(strings.Contains(body, "42"), Equals, true)
	// TODO: check that we receive Content-Type: json/application
}

func (s *HandlersSuite) TestSnapwebSignaling(c *C) {
	os.Setenv("SNAP_DATA", c.MkDir())

	WritePidFile()

	ready := make(chan bool)
	done := make(chan bool)

	// the thread where we test the function
	go func() {
		for {
			ready <- true
			WaitForSigHup()
			// say the test passed
			done <- true
		}
	}()

	// send the signal, *once* the function is ready to be tested
	<-ready
	time.Sleep(1000)
	SendSignalToSnapweb()

	c.Assert(<-done, Equals, true)

	// do it a second time
	<-ready
	time.Sleep(1000)
	SendSignalToSnapweb()

	c.Assert(<-done, Equals, true)
}

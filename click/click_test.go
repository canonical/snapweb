/*
 Copyright 2013-2014 Canonical Ltd.

 This program is free software: you can redistribute it and/or modify it
 under the terms of the GNU General Public License version 3, as published
 by the Free Software Foundation.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranties of
 MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR
 PURPOSE.  See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along
 with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

package click

import (
	"encoding/json"
	"fmt"
	"testing"

	. "launchpad.net/gocheck"

	. "launchpad.net/clapper/click/cappinfo"
)

func TestClick(t *testing.T) { TestingT(t) }

type clickSuite struct{}

var _ = Suite(&clickSuite{})

func (cs *clickSuite) TestParseAppId(c *C) {
	app, err := ParseAppId("com.ubuntu.clock_clock")
	c.Assert(err, IsNil)
	c.Check(app.Package, Equals, "com.ubuntu.clock")
	c.Check(app.InPackage("com.ubuntu.clock"), Equals, true)
	c.Check(app.Application, Equals, "clock")
	c.Check(app.Version, Equals, "")
	c.Check(app.Click, Equals, true)
	c.Check(app.Original(), Equals, "com.ubuntu.clock_clock")
	c.Check(fmt.Sprintf("%s", app), Equals, "com.ubuntu.clock_clock")
	c.Check(app.DispatchPackage(), Equals, "com.ubuntu.clock")

	app, err = ParseAppId("com.ubuntu.clock_clock_10")
	c.Assert(err, IsNil)
	c.Check(app.Package, Equals, "com.ubuntu.clock")
	c.Check(app.InPackage("com.ubuntu.clock"), Equals, true)
	c.Check(app.Application, Equals, "clock")
	c.Check(app.Version, Equals, "10")
	c.Check(app.Click, Equals, true)
	c.Check(app.Original(), Equals, "com.ubuntu.clock_clock_10")
	c.Check(fmt.Sprintf("%s", app), Equals, "com.ubuntu.clock_clock_10")
	c.Check(app.Versioned(), Equals, "com.ubuntu.clock_clock_10")
	c.Check(app.Base(), Equals, "com.ubuntu.clock_clock")
	c.Check(app.DesktopId(), Equals, "com.ubuntu.clock_clock_10.desktop")
	c.Check(app.DispatchPackage(), Equals, "com.ubuntu.clock")

	for _, s := range []string{"com.ubuntu.clock_clock_10_4", "com.ubuntu.clock", ""} {
		app, err = ParseAppId(s)
		c.Check(app, IsNil)
		c.Check(err, Equals, ErrInvalidAppId)
	}
}

func (cs *clickSuite) TestVersionedPanic(c *C) {
	app, err := ParseAppId("com.ubuntu.clock_clock")
	c.Assert(err, IsNil)
	c.Check(func() { app.Versioned() }, PanicMatches, `Versioned\(\) on AppId without version/not verified:.*`)
}

func (cs *clickSuite) TestParseAppIdLegacy(c *C) {
	app, err := ParseAppId("_python3.4")
	c.Assert(err, IsNil)
	c.Check(app.Package, Equals, "")
	c.Check(app.InPackage(""), Equals, true)
	c.Check(app.Application, Equals, "python3.4")
	c.Check(app.Version, Equals, "")
	c.Check(app.Click, Equals, false)
	c.Check(app.Original(), Equals, "_python3.4")
	c.Check(app.Versioned(), Equals, "python3.4")
	c.Check(app.Base(), Equals, "python3.4")
	c.Check(app.DesktopId(), Equals, "python3.4.desktop")
	c.Check(app.DispatchPackage(), Equals, "python3.4")

	for _, s := range []string{"_.foo", "_foo/", "_/foo"} {
		app, err = ParseAppId(s)
		c.Check(app, IsNil)
		c.Check(err, Equals, ErrInvalidAppId)
	}
}

func (cs *clickSuite) TestJSON(c *C) {
	for _, appId := range []string{"com.ubuntu.clock_clock", "com.ubuntu.clock_clock_10", "_python3.4"} {
		app, err := ParseAppId(appId)
		c.Assert(err, IsNil, Commentf(appId))
		b, err := json.Marshal(app)
		c.Assert(err, IsNil, Commentf(appId))
		var vapp *AppId
		err = json.Unmarshal(b, &vapp)
		c.Assert(err, IsNil, Commentf(appId))
		c.Check(vapp, DeepEquals, app)
	}
}

func (cs *clickSuite) TestIcon(c *C) {
	app, err := ParseAppId("_python3.4")
	c.Assert(err, IsNil)
	c.Check(app.Icon(), Equals, "/usr/share/pixmaps/python3.4.xpm")
}

func (s *clickSuite) TestUser(c *C) {
	u, err := User()
	c.Assert(err, IsNil)
	c.Assert(u, NotNil)
}

func (s *clickSuite) TestInstalledNegative(c *C) {
	u, err := User()
	c.Assert(err, IsNil)
	app, err := ParseAppId("com.foo.bar_baz")
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, false)
}

func (s *clickSuite) TestInstalledVersionNegative(c *C) {
	u, err := User()
	c.Assert(err, IsNil)
	app, err := ParseAppId("com.ubuntu.clock_clock_1000.0")
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, false)
}

func (s *clickSuite) TestInstalledClock(c *C) {
	u, err := User()
	c.Assert(err, IsNil)
	ver := u.ccu.CGetVersion("com.ubuntu.clock")
	if ver == "" {
		c.Skip("no com.ubuntu.clock pkg installed")
	}
	app, err := ParseAppId("com.ubuntu.clock_clock")
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, true)
	app, err = ParseAppId("com.ubuntu.clock_clock_" + ver)
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, true)

	app, err = ParseAppId("com.ubuntu.clock_clock_10" + ver)
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, false)

	// setVersion
	app, err = ParseAppId("com.ubuntu.clock_clock")
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, true), Equals, true)
	c.Check(app.Version, Equals, ver)
}

func (s *clickSuite) TestInstalledLegacy(c *C) {
	u, err := User()
	c.Assert(err, IsNil)
	app, err := ParseAppId("_python3.4")
	c.Assert(err, IsNil)
	c.Check(u.Installed(app, false), Equals, true)
}

func (s *clickSuite) TestParseAndVerifyAppId(c *C) {
	u, err := User()
	c.Assert(err, IsNil)

	app, err := ParseAndVerifyAppId("_.foo", nil)
	c.Assert(err, Equals, ErrInvalidAppId)
	c.Check(app, IsNil)

	app, err = ParseAndVerifyAppId("com.foo.bar_baz", nil)
	c.Assert(err, IsNil)
	c.Check(app.Click, Equals, true)
	c.Check(app.Application, Equals, "baz")

	app, err = ParseAndVerifyAppId("_non-existent-app", u)
	c.Assert(err, Equals, ErrMissingApp)
	c.Check(app, NotNil)
	c.Check(app.Original(), Equals, "_non-existent-app")
}

func (s *clickSuite) TestSymbolicAppendsSymbolicIfIconIsName(c *C) {
	symb := symbolic("foo")
	c.Check(symb, Equals, "foo-symbolic")
}

func (s *clickSuite) TestSymbolicLeavesAloneIfIconIsPath(c *C) {
	symb := symbolic("foo/bar")
	c.Check(symb, Equals, "foo/bar")
}

func (s *clickSuite) TestSymbolicIconCallsSymbolic(c *C) {
	symbolic = func(string) string { return "xyzzy" }
	defer func() { symbolic = _symbolic }()
	app, err := ParseAppId("_python3.4")
	c.Assert(err, IsNil)
	c.Check(app.SymbolicIcon(), Equals, "xyzzy")
}

func (s *clickSuite) TestSymbolicFromDesktopFile(c *C) {
	orig := cappinfo.AppSymbolicIconFromDesktopId
	cappinfo.AppSymbolicIconFromDesktopId = func(desktopId string) string {
		return "/foo/symbolic"
	}
	defer func() {
		cappinfo.AppSymbolicIconFromDesktopId = orig
	}()
	app, _ := ParseAppId("com.ubuntu.clock_clock_1.2")
	c.Check(app.SymbolicIcon(), Equals, "/foo/symbolic")
}

package snappy

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	. "gopkg.in/check.v1"
)

type IconSuite struct {
	dataPath string
}

var _ = Suite(&IconSuite{})

func (s *IconSuite) SetUpTest(c *C) {
	s.dataPath = c.MkDir()
	os.Setenv("SNAP_APP_DATA_PATH", s.dataPath)
}

func (s *IconSuite) TestIconDir(c *C) {
	iconDir, relativePath, err := IconDir()
	c.Assert(err, IsNil)
	c.Check(iconDir, Equals, filepath.Join(s.dataPath, "icons"))
	c.Check(relativePath, Equals, "icons")
}

func (s *IconSuite) TestNoSnapAppDataPathCausesError(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", "")
	_, _, err := IconDir()
	c.Assert(err, Equals, ErrDataPathNotSet)
}

func (s *IconSuite) TestIconDirCreateFails(c *C) {
	fileAsDir := filepath.Join(s.dataPath, "badDataPath")
	c.Assert(ioutil.WriteFile(fileAsDir, []byte{}, 0644), IsNil)
	os.Setenv("SNAP_APP_DATA_PATH", fileAsDir)
	_, _, err := IconDir()
	c.Assert(err, Equals, ErrOnIconDataPathSet)
}

type IconPathSuite struct {
	dataPath    string
	pkgIconPath string
}

var _ = Suite(&IconPathSuite{})

func (s *IconPathSuite) SetUpTest(c *C) {
	s.dataPath = c.MkDir()
	os.Setenv("SNAP_APP_DATA_PATH", s.dataPath)

	s.pkgIconPath = filepath.Join(c.MkDir(), "pkgIcon.png")
	c.Assert(ioutil.WriteFile(s.pkgIconPath, []byte("png"), 07555), IsNil)
}

func (s *IconPathSuite) TestIconCopy(c *C) {
	relativePath, err := localIconPath("mypackage.sergiusens", s.pkgIconPath)
	c.Assert(err, IsNil)
	iconBaseName := fmt.Sprintf("icons/mypackage.sergiusens_%s", filepath.Base(s.pkgIconPath))
	c.Check(relativePath, Equals, filepath.Join("/", iconBaseName))

	contents, err := ioutil.ReadFile(filepath.Join(s.dataPath, iconBaseName))
	c.Assert(err, IsNil)

	c.Assert(string(contents), Equals, "png")
}

func (s *IconPathSuite) TestIconCopyNoDataPath(c *C) {
	os.Setenv("SNAP_APP_DATA_PATH", "")
	_, err := localIconPath("mypackage.sergiusens", s.pkgIconPath)
	c.Assert(err, Equals, ErrDataPathNotSet)
}

func (s *IconPathSuite) TestIconCopyNoIcon(c *C) {
	_, err := localIconPath("mypackage.sergiusens", "somerandompath")
	c.Assert(err, Equals, ErrIconNotExist)
}

func (s *IconPathSuite) TestIconCopyTargetIconExists(c *C) {
	iconBaseName := fmt.Sprintf("icons/mypackage.sergiusens_%s", filepath.Base(s.pkgIconPath))
	c.Assert(os.MkdirAll(filepath.Join(s.dataPath, "icons"), 0755), IsNil)
	c.Assert(ioutil.WriteFile(filepath.Join(s.dataPath, iconBaseName), []byte{}, 0644), IsNil)

	relativePath, err := localIconPath("mypackage.sergiusens", s.pkgIconPath)
	c.Assert(err, IsNil)
	c.Check(relativePath, Equals, filepath.Join("/", iconBaseName))
}

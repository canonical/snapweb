package oem

import (
	"errors"
	"io/ioutil"

	"launchpad.net/goyaml"
)

type oem struct {
	Name     string `yaml:"name" json:"name"`
	Vendor   string `yaml:"vendor" json:"vendor"`
	Icon     string `yaml:"icon" json:"icon"`
	Version  string `yaml:"version" json:"version"`
	Type     string `yaml:"type" json:"type"`
	Branding struct {
		Name    string `yaml:"name" json:"name"`
		Subname string `yaml:"subname" json:"subname"`
	} `yaml:"branding" json:"branding"`
	Store struct {
		OemKey string `yaml:"oem-key" json:"oem-key"`
	} `yaml:"store" json:"store"`
}

var ErrNotFound = errors.New("no oem package installed")
var ErrTooMany = errors.New("too many oem packages found")
var ErrDecode = errors.New("decoding problem")

func Oem() (pkg oem, err error) {
	pkgs, err := glob("/oem/", "package.yaml")

	if len(pkgs) == 0 {
		return pkg, ErrNotFound
	} else if len(pkgs) > 1 || err != nil {
		return pkg, ErrTooMany
	}

	f, err := ioutil.ReadFile(pkgs[0])
	if err != nil {
		return pkg, ErrDecode
	}

	if err := goyaml.Unmarshal([]byte(f), &pkg); err != nil {
		return pkg, ErrDecode
	}

	return pkg, nil
}

package click

import (
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"sync"

	"launchpad.net/clapper/systemd"
	"launchpad.net/go-dbus/v1"
)

type hooks map[string]map[string]string

type Package struct {
	Description string `json:"description"`
	Maintainer  string `json:"maintainer"`
	Name        string `json:"name"`
	Title       string `json:"title"`
	Version     string `json:"version"`
	Hooks       hooks  `json:"hooks"`
	Units       map[string]*systemd.Unit
}

// ClickUser exposes the click package registry for the user.
type ClickUser struct {
	ccu  cClickUser
	lock sync.Mutex
}

// User makes a new ClickUser object for the current user.
func NewUser() (*ClickUser, error) {
	cu := new(ClickUser)
	err := cu.ccu.cInit(cu)
	if err != nil {
		return nil, err
	}
	return cu, nil
}

// ClickDatabase exposes the click package database for the user.
type ClickDatabase struct {
	cdb  cClickDB
	lock sync.Mutex
	conn *dbus.Connection
}

func NewDatabase(conn *dbus.Connection) (*ClickDatabase, error) {
	db := new(ClickDatabase)
	err := db.cdb.cInit(db)
	if err != nil {
		return nil, err
	}
	db.conn = conn

	return db, nil
}

// GetPackages returns the information relevant to pkg unless it is an empty string
// where it returns the information for all packages.
func (db *ClickDatabase) GetPackages(pkg string) (packages []Package, err error) {
	//m, err := db.cdb.cGetManifests()
	m, err := exec.Command("click", "list", "--manifest").CombinedOutput()
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(m, &packages); err != nil {
		return nil, err
	}

	if pkg != "" {
		for i := range packages {
			if packages[i].Name == pkg {
				packages = []Package{packages[i]}
				break
			}
		}

		if len(packages) != 1 {
			return nil, errors.New("package not found")
		}
	}

	for i := range packages {
		if err := packages[i].getServices(db.conn); err != nil {
			return nil, err
		}
	}

	return packages, nil
}

func (p *Package) getServices(conn *dbus.Connection) error {
	systemD := systemd.New(conn)

	p.Units = make(map[string]*systemd.Unit)

	for k, v := range p.Hooks {
		if _, ok := v["systemd"]; ok {
			serviceName := fmt.Sprintf("clickowned_%s_%s_%s.service", p.Name, k, p.Version)

			if unit, err := systemD.Unit(serviceName); err == nil {
				p.Units[k] = unit
			} else {
				return err
			}
		}
	}

	return nil
}

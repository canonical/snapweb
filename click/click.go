package click

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"sync"

	"launchpad.net/clapper/systemd"
	"launchpad.net/go-dbus/v1"
)

type hooks map[string]map[string]string

type ClickPackage struct {
	Description string `json:"description"`
	Maintainer  string `json:"maintainer"`
	Name        string `json:"name"`
	Title       string `json:"title"`
	Version     string `json:"version"`
	Hooks       hooks  `json:"hooks"`
	Services    map[string]*systemd.Unit
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
}

func NewDatabase() (*ClickDatabase, error) {
	db := new(ClickDatabase)
	err := db.cdb.cInit(db)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func (db *ClickDatabase) Manifests(conn *dbus.Connection) (packages []ClickPackage, err error) {
	//m, err := db.cdb.cGetManifests()
	m, err := exec.Command("click", "list", "--manifest").CombinedOutput()
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(m, &packages); err != nil {
		return nil, err
	}

	for i := range packages {
		if err := packages[i].GetServices(conn); err != nil {
			return nil, err
		}
	}

	return packages, nil
}

func (p *ClickPackage) GetServices(conn *dbus.Connection) error {
	systemD := systemd.New(conn)

	p.Services = make(map[string]*systemd.Unit)

	for k, v := range p.Hooks {
		if _, ok := v["systemd"]; ok {
			serviceName := fmt.Sprintf("clickowned_%s_%s_%s.service", p.Name, k, p.Version)

			if unit, err := systemD.Unit(serviceName); err == nil {
				p.Services[k] = unit
			} else {
				return err
			}
		}
	}

	return nil
}

package click

import (
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strings"
	"sync"

	"launchpad.net/clapper/systemd"
	"launchpad.net/go-dbus/v1"
)

type services []map[string]string

type Package struct {
	Description string          `json:"description"`
	Maintainer  string          `json:"maintainer"`
	Name        string          `json:"name"`
	Version     string          `json:"version"`
	Services    services        `json:"services"`
	Ports       map[string]uint `json:"ports"`
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
				return packages, nil
			}
		}

		return nil, errors.New("package not found")
	}

	for i := range packages {
		if err := packages[i].getServices(db.conn); err != nil {
			return nil, err
		}
	}

	return packages, nil
}

// Install installs pkg onto the system, if pkg has a .snap suffix it will
// require to have a full path of the package to exist locally on the system.
// In every other case, it will install from the store.
func (db *ClickDatabase) Install(pkg string) error {
	if strings.HasSuffix(pkg, ".snap") {
		return errors.New("local installation not implemented")
	}

	if out, err := exec.Command("snappy", "install", pkg).CombinedOutput(); err != nil {
		return fmt.Errorf("unable to install package: %s", out)
	}

	return nil
}

// Uninstall removes pkg from the system.
func (db *ClickDatabase) Uninstall(pkg string) error {
	if out, err := exec.Command("snappy", "uninstall", pkg).CombinedOutput(); err != nil {
		return fmt.Errorf("unable to uninstall package: %s", out)
	}

	return nil
}

func (p *Package) isService(serviceName string) bool {
	for i := range p.Services {
		if name, ok := p.Services[i]["name"]; ok {
			if name == serviceName {
				return true
			}
		}
	}

	return false
}

// Service returns the full service name on systemd
func (p *Package) Service(serviceName string) (string, error) {
	if !p.isService(serviceName) {
		return "", errors.New("service does not exist")
	}

	return fmt.Sprintf("%s_%s_%s.service", p.Name, serviceName, p.Version), nil
}

func (p *Package) getServices(conn *dbus.Connection) error {
	systemD := systemd.New(conn)

	for i := range p.Services {
		if serviceName, ok := p.Services[i]["name"]; ok {
			serviceName := fmt.Sprintf("%s_%s_%s.service", p.Name, serviceName, p.Version)

			if unit, err := systemD.Unit(serviceName); err == nil {
				if status, err := unit.Status(); err == nil {
					p.Services[i]["status"] = status
				} else {
					fmt.Println("error getting status:", err)
				}
			} else {
				fmt.Println("error loading unit:", err)
			}
		}
	}

	return nil
}

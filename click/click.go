package click

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"launchpad.net/clapper/systemd"
	"launchpad.net/go-dbus/v1"
)

type services []map[string]string

type Package struct {
	Description string          `json:"description"`
	Maintainer  string          `json:"maintainer"`
	Name        string          `json:"name"`
	Version     string          `json:"version"`
	Services    services        `json:"services,omitempty"`
	Ports       map[string]uint `json:"ports,omitempty"`
}

// ClickDatabase exposes the click package database for the user.
type ClickDatabase struct {
	conn *dbus.Connection
}

func NewDatabase(conn *dbus.Connection) *ClickDatabase {
	return &ClickDatabase{conn: conn}
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

	f, err := os.Open("/var/lib/systemd/snappy")
	if err != nil {
		return err
	}
	defer f.Close()

	services, err := f.Readdirnames(0)
	if err != nil {
		return err
	}

	for _, service := range services {
		if strings.HasPrefix(service, p.Name) && strings.HasSuffix(service, p.Version) {
			serviceParts := strings.Split(service, "_")
			if len(serviceParts) != 3 {
				return errors.New("invalid service in system")
			}

			serviceInfo := map[string]string{"name": serviceParts[1]}

			serviceName := fmt.Sprintf("%s.service", service)

			if unit, err := systemD.Unit(serviceName); err == nil {
				if status, err := unit.Status(); err == nil {
					serviceInfo["status"] = status
				} else {
					return fmt.Errorf("error getting status: %s", err)
				}

				p.Services = append(p.Services, serviceInfo)
			} else {
				return fmt.Errorf("error loading unit: %s", err)
			}
		}
	}

	return nil
}

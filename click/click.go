package click

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"launchpad.net/clapper/systemd"
	"launchpad.net/go-dbus/v1"
	"launchpad.net/goyaml"
)

type services []map[string]string

type Package struct {
	Description string   `json:"description"`
	Maintainer  string   `json:"maintainer"`
	Name        string   `json:"name"`
	Version     string   `json:"version"`
	Icon        string   `json:"icon,omitempty"`
	Services    services `json:"services,omitempty"`
	Ports       struct {
		Required uint `json:"required,omitempty"`
	} `json:"ports,omitempty"`
}

// ClickDatabase exposes the click package database for the user.
type ClickDatabase struct {
	conn *dbus.Connection
}

type storePayload map[string]interface{}

func NewDatabase(conn *dbus.Connection) *ClickDatabase {
	return &ClickDatabase{conn: conn}
}

// GetPackages returns the information relevant to pkg unless it is an empty string
// where it returns the information for all packages.
func (db *ClickDatabase) GetPackages(pkg string) (packages []Package, err error) {
	m, err := exec.Command("click", "list", "--manifest").CombinedOutput()
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(m, &packages); err != nil {
		return nil, err
	}

	if pkg != "" {
		var singlePackage []Package
		for i := range packages {
			if packages[i].Name == pkg {
				singlePackage = append(singlePackage, packages[i])
			}
		}

		if len(singlePackage) != 1 {
			return nil, errors.New("package not found")
		}

		packages = singlePackage
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

	go func() {
		if !strings.Contains(pkg, ".") {
			pkg = "com.ubuntu.snappy." + pkg
		}

		dataPath, err := IconDir()
		if err != nil {
			fmt.Println("Cannot obtain dataPath", err)
			return
		}

		u, _ := url.Parse("https://search.apps.ubuntu.com/api/v1/package/")
		u, err = u.Parse(pkg)
		if err != nil {
			fmt.Println("failed to parse store package url for", pkg, err)
			return
		}

		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			fmt.Println("failed to create request", u.String(), err)
			return
		}
		req.Header.Set("Accept", "application/hal+json")
		req.Header.Set("X-Ubuntu-Frameworks", strings.Join(Frameworks(), ","))

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Println("failed to request", u.String(), err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Println("failed to request", u.String(), "exited with status:", resp.StatusCode)
			return
		}

		var storePkg storePayload
		dec := json.NewDecoder(resp.Body)
		if err := dec.Decode(&storePkg); err != nil {
			fmt.Println("Issue while decoding store payload", err)
			return
		}

		if iconUrl, ok := storePkg["icon_url"]; ok {
			url := iconUrl.(string)
			if err := download(filepath.Join(dataPath, pkg)+".png", url); err != nil {
				fmt.Println("Cannot downlad icon:", err)
			}
		} else {
			fmt.Println("No icon url for", pkg, "found")
			return
		}

	}()

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

func Frameworks() (frameworks []string) {
	fis, err := ioutil.ReadDir("/usr/share/click/frameworks/")
	if err != nil {
		fmt.Println("issues while getting frameworks:", err)
		return nil
	}

	frameworks = make([]string, 0, len(fis))
	for _, fi := range fis {
		framework := fi.Name()
		if ext := filepath.Ext(framework); ext == ".framework" {
			frameworks = append(frameworks, strings.TrimSuffix(framework, ext))
		}
	}

	fmt.Println("Frameworks found:", frameworks)

	return frameworks
}

func download(fileName, url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	f, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer func() {
		f.Close()
		if err != nil {
			os.Remove(fileName)
		}
	}()

	if _, err := io.Copy(f, resp.Body); err != nil {
		return err
	}

	return nil
}

func IconDir() (dataPath string, err error) {
	if dataPath = os.Getenv("SNAPP_APP_DATA_PATH"); dataPath == "" {
		fmt.Println("WARNING: SNAPP_APP_DATA_PATH is not set")

		// handcraft a datapath
		pkgPath := filepath.Join("/apps", "webdm", "current", "meta", "package.yaml")
		contents, err := ioutil.ReadFile(pkgPath)
		if err != nil {
			return "", err
		}

		var webdmPkg map[string]interface{}
		if err := goyaml.Unmarshal(contents, &webdmPkg); err != nil {
			return "", err
		}

		if version, ok := webdmPkg["version"]; ok {
			dataPath = filepath.Join("/var", "lib", "apps", "webdm", fmt.Sprintf("%v", version))
		} else {
			return "", fmt.Errorf("version not found in %v", webdmPkg)
		}
	}

	dataPath = filepath.Join(dataPath, "icons")
	if err := os.MkdirAll(dataPath, 0755); err != nil {
		fmt.Println("WARNING: cannot create", dataPath)
		dataPath = ""
	}

	return dataPath, nil
}

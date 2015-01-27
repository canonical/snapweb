package click

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"

	"launchpad.net/go-dbus/v1"
	"launchpad.net/webdm/systemd"
)

type handler struct {
	conn *dbus.Connection
}

func NewHandler(systemConnection *dbus.Connection) *handler {
	return &handler{conn: systemConnection}
}

func (h *handler) getAll(w http.ResponseWriter, r *http.Request) {
	db := NewDatabase(h.conn)

	if pkgs, err := db.GetPackages(""); err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	} else {
		enc := json.NewEncoder(w)
		if err := enc.Encode(pkgs); err != nil {
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		}
	}
}

func (h *handler) getIcon(w http.ResponseWriter, r *http.Request) {
	db := NewDatabase(h.conn)

	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	pkgs, err := db.GetPackages(pkgName)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	iconPath := filepath.Join("/apps", pkgName, "current", pkgs[0].Icon)

	icon, err := os.Open(iconPath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer icon.Close()

	// all icons are SVGs
	if strings.HasPrefix(iconPath, "png") {
		w.Header().Set("Content-Type", "image/png")
	} else if strings.HasPrefix(iconPath, "svg") {
		w.Header().Set("Content-Type", "image/svg+xml")
	}

	//http.ServeContent(w, r, "icon", time.Time{}, icon)
	if _, err := io.Copy(w, icon); err != nil {
		http.NotFound(w, r)
		return
	}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	db := NewDatabase(h.conn)

	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	if pkgs, err := db.GetPackages(pkgName); err != nil {
		http.NotFound(w, r)
		return
	} else {
		enc := json.NewEncoder(w)
		if err := enc.Encode(pkgs[0]); err != nil {
			fmt.Fprint(w, "Error")
		}
	}
}

func (h *handler) add(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)

	items := make(map[string]string)

	if err := decoder.Decode(&items); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	db := NewDatabase(h.conn)

	for k, v := range items {
		switch k {
		case "package":
			if err := db.Install(v); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
				return
			}
		default:
			http.NotFound(w, r)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *handler) remove(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	db := NewDatabase(h.conn)

	if err := db.Uninstall(pkgName); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
}

func (h *handler) setService(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]
	serviceName := vars["service"]

	decoder := json.NewDecoder(r.Body)

	action := make(map[string]int)

	if err := decoder.Decode(&action); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	db := NewDatabase(h.conn)

	var service string
	if pkgs, err := db.GetPackages(pkgName); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	} else {
		if service, err = pkgs[0].Service(serviceName); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
			return
		}
	}

	sd := systemd.New(h.conn)

	status, ok := action["status"]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Error")
		return
	}

	switch status {
	case 1:
		if err := sd.Start(service, "reload"); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
			return
		}
	case 0:
		if err := sd.Stop(service, "reload"); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
			return
		}
	default:
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Unsupported request")
		return
	}
}

func (h *handler) MakeMuxer(prefix string) http.Handler {
	var m *mux.Router

	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	// Get all of packages.
	m.HandleFunc("/", h.getAll).Methods("GET")
	// Add a package
	m.HandleFunc("/", h.add).Methods("POST")
	// Remove a package
	m.HandleFunc("/{pkg}", h.remove).Methods("DELETE")

	// Set the state for a service
	m.HandleFunc("/{pkg}/{service}", h.setService).Methods("PUT")

	// get specific package
	m.HandleFunc("/{pkg}", h.get).Methods("GET")

	// get specific package icon.
	m.HandleFunc("/{pkg}/icon", h.getIcon).Methods("GET")

	return m
}

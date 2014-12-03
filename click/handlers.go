package click

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	"launchpad.net/go-dbus/v1"
)

type handler struct {
	conn *dbus.Connection
}

func NewHandler(systemConnection *dbus.Connection) *handler {
	return &handler{conn: systemConnection}
}

func (h *handler) getAll(w http.ResponseWriter, r *http.Request) {
	db, err := NewDatabase(h.conn)
	if err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	if pkgs, err := db.GetPackages(""); err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
	} else {
		enc := json.NewEncoder(w)
		if err := enc.Encode(pkgs); err != nil {
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		}
	}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	db, err := NewDatabase(h.conn)
	if err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

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
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	db, err := NewDatabase(h.conn)
	if err != nil {
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	for k, v := range items {
		switch k {
		case "package":
			if err := db.Install(v); err != nil {
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

	// get specific package
	m.HandleFunc("/{pkg}", h.get).Methods("GET")

	return m
}

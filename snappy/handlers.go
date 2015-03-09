package snappy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"

	"launchpad.net/snappy/snappy"
)

type snapPkg struct {
	Name      string          `json:"name"`
	Version   string          `json:"version"`
	Installed bool            `json:"installed"`
	Type      snappy.SnapType `json:"type"`
	UIPort    uint64          `json:"ui_port,omitempty"`
	UIUri     string          `json:"ui_uri,omitempty"`
}

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func snapQueryToPayload(snapQ snappy.Part) (snap snapPkg) {
	snap.Name = snapQ.Name()
	snap.Version = snapQ.Version()
	snap.Installed = snapQ.IsInstalled()
	snap.Type = snapQ.Type()

	if snap.Type == snappy.SnapTypeApp || snap.Type == snappy.SnapTypeFramework {
		if snapInstalled, ok := snapQ.(*snappy.SnapPart); ok {
			port, uri := uiAccess(snapInstalled.Services())
			snap.UIPort = port
			snap.UIUri = uri
		}
	}

	return snap
}

func uiAccess(services []snappy.Service) (port uint64, uri string) {
	for i := range services {
		if ui, ok := services[i].Ports.External["ui"]; ok {
			ui := strings.Split(ui.Port, "/")
			if len(ui) == 2 {
				port, err := strconv.ParseUint(ui[0], 0, 64)
				if err != nil {
					return 0, ""
				}

				return port, ui[1]
			}
		}
	}

	return 0, ""
}

func (h *handler) getAll(w http.ResponseWriter, r *http.Request) {
	m := snappy.NewMetaRepository()

	installedSnaps, err := m.Installed()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	snapQs := make([]snapPkg, 0, len(installedSnaps))

	for i := range installedSnaps {
		snapQs = append(snapQs, snapQueryToPayload(installedSnaps[i]))
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(snapQs); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	if snapQ := snappy.ActiveSnapByName(pkgName); snapQ == nil {
		http.NotFound(w, r)
		return
	} else {
		snap := snapQueryToPayload(snapQ)
		enc := json.NewEncoder(w)
		fmt.Printf("%#v\n", snap)
		if err := enc.Encode(snap); err != nil {
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

	for k, v := range items {
		switch k {
		case "package":
			fmt.Println(v)
			http.NotFound(w, r)
			return
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
	fmt.Println(pkgName)
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

	// get specific package
	m.HandleFunc("/{pkg}", h.get).Methods("GET")

	return m
}

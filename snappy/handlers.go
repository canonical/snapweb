package snappy

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

type installStatus map[string]uint64

type handler struct {
	installStatus installStatus
}

func NewHandler() *handler {
	return &handler{
		installStatus: make(installStatus),
	}
}

func (h *handler) getAll(w http.ResponseWriter, r *http.Request) {
	payload, err := allPackages()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(payload); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	payload, err := packagePayload(pkgName)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(payload); err != nil {
		fmt.Fprint(w, "Error")
	}
}

func (h *handler) add(w http.ResponseWriter, r *http.Request) {
	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	switch err := installPackage(pkgName); err {
	case errPackageInstalled:
		w.WriteHeader(http.StatusOK)
	case errPackageInstallInProgress:
		w.WriteHeader(http.StatusBadRequest)
	case errPackageNotFound:
		w.WriteHeader(http.StatusNotFound)
	case nil:
		w.WriteHeader(http.StatusAccepted)
	default:
		w.WriteHeader(http.StatusInternalServerError)
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

	// get specific package
	m.HandleFunc("/{pkg}", h.get).Methods("GET")

	// Add a package
	m.HandleFunc("/{pkg}", h.add).Methods("PUT")

	return m
}

package snappy

import (
	"encoding/json"
	"fmt"
	"net/http"

	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/progress"

	"github.com/gorilla/mux"
)

type handler struct {
	installStatus *webprogress.Status
}

func NewHandler() *handler {
	return &handler{
		installStatus: webprogress.New(),
	}
}

func (h *handler) getAll(w http.ResponseWriter, r *http.Request) {
	payload, err := h.allPackages()
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

	payload, err := h.packagePayload(pkgName)
	if err != nil {
		http.NotFound(w, r)
		fmt.Fprintln(w, err, pkgName)
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

	err := h.installPackage(pkgName)

	switch err {
	case snappy.ErrAlreadyInstalled:
		w.WriteHeader(http.StatusOK)
	case webprogress.ErrPackageInstallInProgress:
		w.WriteHeader(http.StatusBadRequest)
	case snappy.ErrPackageNotFound:
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

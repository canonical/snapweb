package snappy

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"log"

	"launchpad.net/snappy/snappy"
	"launchpad.net/webdm/webprogress"

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
	dec := json.NewDecoder(r.Body)

	var filter ListFilter
	if err := dec.Decode(&filter); err != nil && err != io.EOF {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	payload, err := h.allPackages(filter.InstalledOnly)
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

	enc := json.NewEncoder(w)
	var msg string

	err := h.installPackage(pkgName)

	switch err {
	case snappy.ErrAlreadyInstalled:
		w.WriteHeader(http.StatusOK)
		msg = "Installed"
	case webprogress.ErrPackageInstallInProgress:
		w.WriteHeader(http.StatusBadRequest)
		msg = "Installation in progress"
	case snappy.ErrPackageNotFound:
		w.WriteHeader(http.StatusNotFound)
		msg = "Package not found"
	case nil:
		w.WriteHeader(http.StatusAccepted)
		msg = "Accepted"
	default:
		w.WriteHeader(http.StatusInternalServerError)
		msg = "Processing error"
	}

	response := Response{Message: msg, Package: pkgName}
	if err := enc.Encode(response); err != nil {
		log.Print(err)
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

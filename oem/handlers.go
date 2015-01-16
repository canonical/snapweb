package oem

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"launchpad.net/goyaml"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	pkgs, err := glob("/oem/", "package.yaml")

	if len(pkgs) == 0 {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprint(w, "No OEM package installed")
		return
	} else if len(pkgs) > 1 || err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Matches %d, Error: %v", len(pkgs), err))
		return
	}

	f, err := ioutil.ReadFile(pkgs[0])
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	var data oem

	if err := goyaml.Unmarshal([]byte(f), &data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
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

	// Get oem branding.
	m.HandleFunc("/", h.get).Methods("GET")

	return m
}

func glob(dir string, filename string) (pkgs []string, err error) {
	err = filepath.Walk(dir, func(path string, f os.FileInfo, err error) error {
		if filepath.Base(path) == filename {
			pkgs = append(pkgs, path)
		}

		return nil
	})

	return pkgs, err
}

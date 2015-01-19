package oem

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	data, err := Oem()
	if err != nil {
		if err == ErrNotFound {
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprint(w, "No OEM package installed")
		} else if err == ErrTooMany {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		} else if err == ErrDecode {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		}
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

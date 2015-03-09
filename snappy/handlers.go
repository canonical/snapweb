package snappy

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
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

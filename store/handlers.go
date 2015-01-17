package store

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"runtime"
	"strings"

	"launchpad.net/clapper/click"

	"github.com/gorilla/mux"
)

type handler struct{}

func NewHandler() *handler {
	return &handler{}
}

var (
	storeSearchUri, _  = url.Parse("https://search.apps.ubuntu.com/api/v1/search")
	storeDetailsUri, _ = url.Parse("https://search.apps.ubuntu.com/api/v1/package/")
)

var arches = map[string]string{
	"386":   "i386",
	"amd64": "amd64",
	"arm":   "armhf",
}

func (h *handler) getSearch(w http.ResponseWriter, r *http.Request) {
	arch, ok := arches[runtime.GOARCH]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Error")
		return
	}

	query := r.URL.Query()

	u := storeSearchUri
	u.RawQuery = query.Encode()

	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
	req.Header.Set("Accept", "application/hal+json")
	req.Header.Set("X-Ubuntu-Frameworks", strings.Join(click.Frameworks(), ","))
	req.Header.Set("X-Ubuntu-Architecture", arch)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	if _, err := io.Copy(w, resp.Body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
}

func (h *handler) getPackage(w http.ResponseWriter, r *http.Request) {
	arch, ok := arches[runtime.GOARCH]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Error")
		return
	}

	// Get the Key.
	vars := mux.Vars(r)
	pkgName := vars["pkg"]

	u, err := storeDetailsUri.Parse(pkgName)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
	req.Header.Set("Accept", "application/hal+json")
	req.Header.Set("X-Ubuntu-Frameworks", strings.Join(click.Frameworks(), ","))
	req.Header.Set("X-Ubuntu-Architecture", arch)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, fmt.Sprintf("Error: %s", err))
		return
	}

	if _, err := io.Copy(w, resp.Body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
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

	// Search
	m.HandleFunc("/search", h.getSearch).Methods("GET")

	// Query package
	m.HandleFunc("/package/{pkg}", h.getPackage).Methods("GET")

	return m
}

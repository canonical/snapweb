package click

import (
	"encoding/json"
	"fmt"
	"net/http"

	"launchpad.net/go-dbus/v1"
)

const urlPath = "/api/v1/packages"

func makePackageHandler(conn *dbus.Connection) (f http.HandlerFunc, err error) {
	db, err := NewDatabase(conn)
	if err != nil {
		return f, err
	}

	return func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {
		case "GET":
			if pkgs, err := db.GetPackages(""); err != nil {
				fmt.Fprint(w, "Error")
			} else {
				enc := json.NewEncoder(w)
				if err := enc.Encode(pkgs); err != nil {
					fmt.Fprint(w, "Error")
				}
			}
		case "POST":
			// Create a new record.
		case "PUT":
			// Update an existing record.
		case "DELETE":
			// Remove the record.
		default:
			// Give an error message.
		}
	}, nil
}

func SetHandleFunc(conn *dbus.Connection) error {
	handler, err := makePackageHandler(conn)
	if err != nil {
		return err
	}

	http.HandleFunc(urlPath, handler)

	return nil
}

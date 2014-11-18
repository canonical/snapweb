package click

/*
#cgo pkg-config: click-0.4
#cgo pkg-config: glib-2.0 gobject-2.0

#include <click-0.4/click.h>
*/
import "C"

import (
	"errors"
	"fmt"
	"runtime"
)

type cClickUser struct {
	cref *C.ClickUser
}

func gchar(s string) *C.gchar {
	return (*C.gchar)(C.CString(s))
}

func gfree(s *C.gchar) {
	C.g_free((C.gpointer)(s))
}

func (ccu *cClickUser) cInit(holder interface{}) error {
	var gerr *C.GError
	cref := C.click_user_new_for_user(nil, nil, &gerr)
	defer C.g_clear_error(&gerr)
	if gerr != nil {
		return fmt.Errorf("faild to make ClickUser: %s", C.GoString((*C.char)(gerr.message)))
	}
	ccu.cref = cref
	runtime.SetFinalizer(holder, func(interface{}) {
		C.g_object_unref((C.gpointer)(cref))
	})
	return nil
}

//gchar* click_user_get_version (ClickUser* self, const gchar* package, GError** error);
func (ccu *cClickUser) cGetVersion(pkgName string) string {
	pkgname := gchar(pkgName)
	defer gfree(pkgname)
	var gerr *C.GError
	defer C.g_clear_error(&gerr)
	ver := C.click_user_get_version(ccu.cref, pkgname, &gerr)
	if gerr != nil {
		return ""
	}
	defer gfree(ver)
	return C.GoString((*C.char)(ver))
}

type cClickDB struct {
	cref *C.ClickDB
}

func (cdb *cClickDB) cInit(holder interface{}) error {
	cref := C.click_db_new()
	cdb.cref = cref
	runtime.SetFinalizer(holder, func(interface{}) {
		C.g_object_unref((C.gpointer)(cref))
	})
	return nil
}

//gchar* click_db_get_manifests_as_string (ClickDB* self, gboolean all_versions, GError** error);
func (cdb *cClickDB) cGetManifests() (string, error) {
	var gerr *C.GError
	defer C.g_clear_error(&gerr)
	cManifests := C.click_db_get_manifests_as_string(cdb.cref, C.FALSE, &gerr)
	if gerr != nil {
		return "", errors.New("cannot get manifests from database")
	}
	defer gfree(cManifests)
	return C.GoString((*C.char)(cManifests)), nil
}

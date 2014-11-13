/*
 Copyright 2013-2014 Canonical Ltd.

 This program is free software: you can redistribute it and/or modify it
 under the terms of the GNU General Public License version 3, as published
 by the Free Software Foundation.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranties of
 MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR
 PURPOSE.  See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along
 with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Package cclick has the internal cgo wrapping libclick for package click.
package cclick

/*
#cgo pkg-config: click-0.4
#cgo pkg-config: glib-2.0 gobject-2.0

#include <click-0.4/click.h>
*/
import "C"

import (
	"fmt"
	"runtime"
)

type CClickUser struct {
	cref *C.ClickUser
}

func gchar(s string) *C.gchar {
	return (*C.gchar)(C.CString(s))
}

func gfree(s *C.gchar) {
	C.g_free((C.gpointer)(s))
}

func (ccu *CClickUser) CInit(holder interface{}) error {
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

func (ccu *CClickUser) CGetVersion(pkgName string) string {
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

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

// Package cblacklist accesses the g_settings notification blacklist

package cblacklist

/*
#cgo pkg-config: gio-unix-2.0
#cgo pkg-config: glib-2.0

#include <stdlib.h>
#include <gio/gio.h>

#define BLACKLIST_CONFIG_SCHEMA_ID "com.ubuntu.notifications.hub"
#define BLACKLIST_KEY "blacklist"

int is_blacklisted(const char *pkgname, const char *appname) {
    static GSettings *pushSettings = NULL;
    GVariantIter *iter;
    gchar *pkg;
    gchar *app;
    int blacklisted = 0;

    if (!pushSettings) {
        GSettingsSchemaSource * source = g_settings_schema_source_get_default ();
        if (!g_settings_schema_source_lookup (g_settings_schema_source_get_default (), BLACKLIST_CONFIG_SCHEMA_ID, TRUE)) {
            return -1;
        }
        pushSettings = g_settings_new(BLACKLIST_CONFIG_SCHEMA_ID);
    }
    GVariant *blacklist = g_settings_get_value(pushSettings, BLACKLIST_KEY);
    g_variant_get (blacklist, "a(ss)", &iter);
    while (g_variant_iter_loop (iter, "(ss)", &pkg, &app)) {
        if (0==g_strcmp0(pkg, pkgname) && 0==g_strcmp0(app, appname)) {
            blacklisted = 1;
            break;
        }
        // No need to free pkg and app, according to GVariant array example
    }
    g_variant_iter_free (iter);
    g_variant_unref (blacklist);
    return blacklisted;
}

*/
import "C"

import (
	"unsafe"

	"launchpad.net/ubuntu-push/click"
)

// IsBlacklisted returns true if the application is in the gsettings blacklist
func IsBlacklisted(app *click.AppId) bool {
	pkgname := C.CString(app.Package)
	appname := C.CString(app.Application)
	defer C.free(unsafe.Pointer(pkgname))
	defer C.free(unsafe.Pointer(appname))
	return C.is_blacklisted(pkgname, appname) == 1
}

/*
 * Copyright 2016-2017 Canonical Ltd.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import QtQuick 2.0
import QtQuick.Window 2.1
import Ubuntu.Web 0.2
import com.canonical.Oxide 1.15 as Oxide

Window {
  title: "Ubuntu Personal Store"
  width: 500
  height: 500

  WebView {
    anchors.fill: parent
    id: webView
    focus: true

    url: "http://127.0.0.1:4200"

    function isNewForegroundWebViewDisposition(disposition) {
        return disposition === Oxide.NavigationRequest.DispositionNewPopup ||
               disposition === Oxide.NavigationRequest.DispositionNewForegroundTab;
    }

    // When the user click an external link, Oxide checks if
    // the embedding app handles new browser view requests
    // through potentially defined slots to the newViewRequested
    // signal. If the embedder does not define a slot for this,
    // it coerces the request to a plain 'same webview' navigation
    // request.
    onNewViewRequested: console.log('New view requested')

    function navigationRequestedDelegate(request) {
        var url = request.url.toString()

        if (isNewForegroundWebViewDisposition(request.disposition)) {
            request.action = Oxide.NavigationRequest.ActionReject
            Qt.openUrlExternally(url)
            return
        }
    }

    onCertificateError: {
      if (error.overridable) {
        error.allow()
      }
    }
  }
}

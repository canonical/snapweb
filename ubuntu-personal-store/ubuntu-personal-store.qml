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

import QtQuick 2.4
import QtQuick.Controls 1.4
import Ubuntu.Web 0.2
import com.canonical.Oxide 1.15 as Oxide

ApplicationWindow {
  id: main
  property string url: "https://127.0.0.1:5201"

  property string cookiePath: {
      var arg = "--cookie_path="
      var args = Qt.application.arguments
      var argsLength = Qt.application.arguments.length

      for (var i = 0; i < argsLength; i++) {
          if (args[i].indexOf(arg) === 0) {
              return args[i].substring(arg.length)
          }
      }

      return "" // If no cookie path set, don't store cookies at all
  }

  title: "Ubuntu Personal Store"
  width: 500
  height: 500

  toolBar: ToolBar {
    id: toolbar
    visible: false
    anchors.top: parent.top
    ToolButton {
      anchors.top: parent.top
      anchors.left: parent.left
      anchors.bottom: parent.bottom
      width: 40
      text: "❰"
      onClicked: {
        webView.url = main.url + "/store"
        toolbar.visible = false
      }
    }
  }

  WebView {
    anchors.fill: parent
    id: webView
    focus: true

    context: WebContext {
        dataPath: main.cookiePath
        sessionCookieMode: WebContext.SessionCookieModeRestored
    }

    url: main.url + "/store"

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
    onNavigationRequested: {
      var url = request.url.toString()
      if (url.indexOf(main.url) < 0) {
        toolbar.visible = true
      }
      else {
        toolbar.visible = false
      }
    }
  }
}

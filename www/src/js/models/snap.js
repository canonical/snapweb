// snap.js

var _ = require('lodash');
var Backbone = require('backbone');
var Radio = require('backbone.radio');
var prettyBytes = require('pretty-bytes');
var CONF = require('../config.js');
var chan = Radio.channel('root');

/** Snap Model
 *
 * var helloWorld = new Snap({id: 'hello-world'});
 *
 * // fetch from server (http GET)
 * helloWorld.fetch({
 *   success: function(snap) {
 *     console.log(snap);
 *   }
 * });
 *
 * // install (http PUT)
 * // uninstall (http DELETE)
 * // upgrade (http UPGRADE)
 *
 **/

module.exports = Backbone.Model.extend({

  urlRoot: CONF.PACKAGES,

  initialize: function() {

    this.on('add sync', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;

      if (
        status === CONF.INSTALL_STATE.INSTALLING ||
        status === CONF.INSTALL_STATE.UNINSTALLING
      ) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }

    });

    this.on('error', function(model, response, opts) {
      var json = JSON.parse(response.responseText);
      var previous = model.previousAttributes();
      var message;
      if (json && json.message) {
        message = json.message;
      } else {
        message = 'Sorry, something went wrong :(';
      }
      previous.message = message;
      model.set(previous);
      chan.command('alert:error', model);
    });

    this.on('add change:status', this.onStatusChange);
    this.on('add change:installedSize', this.onInstalledSizeChange);
    this.on('add change:downloadSize', this.onDownloadSizeChange);
  },

  onDownloadSizeChange: function(model) {
    var bytes = model.get('downloadSize');
    model.set(
      'prettyDownloadSize', this._prettyBytes(model.get('downloadSize'))
    );
  },

  onInstalledSizeChange: function(model) {
    var bytes = model.get('installedSize');
    model.set(
      'prettyInstalledSize', this._prettyBytes(model.get('installedSize'))
    );
  },

  _prettyBytes: function(bytes) {
    if (_.isNumber(bytes) && bytes >= 0) {
      return prettyBytes(bytes);
    } else {
      return false;
    }
  },

  onStatusChange: function(model) {
    this.setInstallActionString(model);
    this.setInstallHTMLClass(model);
  },

  setInstallHTMLClass: function(model) {
    var state = model.get('status');
    var installHTMLClass = '';

    if (state === CONF.INSTALL_STATE.UNINSTALLED) {
      installHTMLClass = 'b-installer--install';
    }

    if (state === CONF.INSTALL_STATE.INSTALLED) {
      installHTMLClass = 'b-installer--uninstall';
    }

    if (state === CONF.INSTALL_STATE.INSTALLING) {
      installHTMLClass = 'b-installer--install b-installer--thinking';
    }

    if (state === CONF.INSTALL_STATE.UNINSTALLING) {
      installHTMLClass = 'b-installer--uninstall b-installer--thinking';
    }

    return model.set('installHTMLClass', installHTMLClass);

  },

  setInstallActionString: function(model) {
    var state = model.get('status');
    var action;

    switch (state) {
      case CONF.INSTALL_STATE.INSTALLED:
        action = 'Uninstall';
        break;
      case CONF.INSTALL_STATE.INSTALLING:
        action = 'Installing…';
        break;
      case CONF.INSTALL_STATE.UNINSTALLED:
        action = 'Install';
        break;
      case CONF.INSTALL_STATE.UNINSTALLING:
        action = 'Uninstalling…';
        break;
      default:
        // XXX
        // has the effect of hiding the install button in the view,
        // as we have an indeterminate state
        return model.unset('installActionString');
    }

    return model.set('installActionString', action);
  },

  parse: function(response) {

    var type = response.type;
    var id  = response.id;

    if (response.hasOwnProperty('icon') && !response.icon.length) {
      response.icon = this.defaults.icon;
    }

    if (response.hasOwnProperty('origin') && !response.origin.length) {
      response.origin = this.defaults.origin;
    }

    if (type) {
      if (_.contains(CONF.NON_INSTALLABLE_TYPES, type)) {
        response.isInstallable = false;
      }
    }

    if (id) {
      if (_.contains(CONF.NON_INSTALLABLE_IDS, id)) {
        response.isInstallable = false;
      }
    }

    return response;
  },

  defaults: {
    icon: '/public/images/default-package-icon.svg',
    installActionString: false,
    origin: '-',
    installedSize: false,
    downloadSize: false,
    isInstallable: true
  }

});

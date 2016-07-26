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
 * // remove (http DELETE)
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
        status === CONF.INSTALL_STATE.REMOVING
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
    this.on('change:installed_size', this.onInstalledSizeChange);
    this.on('change:download_size', this.onDownloadSizeChange);
  },

  onDownloadSizeChange: function(model) {
    var bytes = model.get('download_size');
    model.set(
      'prettyDownloadSize',
      this.prettifyBytes(Number(model.get('download_size')))
    );
  },

  onInstalledSizeChange: function(model) {
    var bytes = model.get('installed_size');
    model.set(
      'prettyInstalledSize',
      this.prettifyBytes(Number(model.get('installed_size')))
    );
  },

  prettifyBytes: function(bytes) {
    if (_.isFinite(bytes)) {
      return prettyBytes(bytes);
    } else {
      return '';
    }
  },

  onStatusChange: function(model) {
    this.setInstallActionString(model);
    this.setInstallHTMLClass(model);
    this.setInstallButtonClass(model);
  },

  // XXX move to install behaviour
  setInstallHTMLClass: function(model) {
    var state = model.get('status');
    var installHTMLClass = '';

    if (state === CONF.INSTALL_STATE.REMOVED) {
      installHTMLClass = 'b-installer_do_install';
    }

    if (state === CONF.INSTALL_STATE.INSTALLED) {
      installHTMLClass = 'b-installer_do_remove';
    }

    if (state === CONF.INSTALL_STATE.INSTALLING) {
      installHTMLClass = 'b-installer_do_install b-installer_thinking';
    }

    if (state === CONF.INSTALL_STATE.REMOVING) {
      installHTMLClass = 'b-installer_do_remove b-installer_thinking';
    }

    return model.set('installHTMLClass', installHTMLClass);

  },

  setInstallActionString: function(model) {
    var state = model.get('status');
    var action;

    switch (state) {
      case CONF.INSTALL_STATE.INSTALLED:
        action = 'Remove';
        break;
      case CONF.INSTALL_STATE.INSTALLING:
        action = 'Installing…';
        break;
      case CONF.INSTALL_STATE.REMOVED:
        action = 'Install';
        break;
      case CONF.INSTALL_STATE.REMOVING:
        action = 'Removing…';
        break;
      default:
        // XXX
        // has the effect of hiding the install button in the view,
        // as we have an indeterminate state
        return model.unset('installActionString');
    }

    return model.set('installActionString', action);
  },

  setInstallButtonClass: function(model) {
    var state = model.get('status');
    var installButtonClass;

    switch (state) {
      case CONF.INSTALL_STATE.INSTALLED:
      case CONF.INSTALL_STATE.INSTALLING:
        installButtonClass = 'button--secondary';
        break;
      case CONF.INSTALL_STATE.REMOVED:
      case CONF.INSTALL_STATE.REMOVING:
        installButtonClass = 'button--primary';
    }

    return model.set('installButtonClass', installButtonClass);
  },

  parse: function(response) {

    var status = response.status;
    var type = response.type;
    var id  = response.id;

    if (
      status === CONF.INSTALL_STATE.INSTALLED ||
      status === CONF.INSTALL_STATE.REMOVING
    ) {
      response.isInstalled = true;
    } else if (
      status === CONF.INSTALL_STATE.REMOVED ||
      status === CONF.INSTALL_STATE.INSTALLING
    ) {
      response.isInstalled = false;
    }

    if (response.hasOwnProperty('icon') && !response.icon.length) {
      response.icon = this.defaults.icon;
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

    if (response.hasOwnProperty('download_size')) {
      this.set(
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        'prettyDownloadSize',
        this.prettifyBytes(Number(response.download_size))
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      );
    }

    if (response.hasOwnProperty('installed_size')) {
      this.set(
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        'prettyInstalledSize',
        this.prettifyBytes(Number(response.installed_size))
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      );
    }

    return response;
  },

  defaults: {
    icon: '/public/images/default-package-icon.svg',
    installActionString: false,
    isInstallable: true
  }

});

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
      this.prettifyBytes(Number(bytes))
    );
  },

  onInstalledSizeChange: function(model) {
    var bytes = model.get('installed_size');
    model.set(
      'prettyInstalledSize',
      this.prettifyBytes(Number(bytes))
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
    var status = model.get('status');
    if (
        status !== CONF.INSTALL_STATE.INSTALLING &&
        status !== CONF.INSTALL_STATE.REMOVING
    ) {
      model.set('download_progress', 0);
      model.set('task_summary', '');
    }

    this.setInstallActionString(model);
    this.setInstallHTMLClass(model);
    this.setInstallButtonClass(model);
  },

  // XXX move to install behaviour
  setInstallHTMLClass: function(model) {
    var status = model.get('status');
    var type = model.get('type');
    var installHTMLClass = '';

    if (status === CONF.INSTALL_STATE.REMOVED) {
      installHTMLClass = 'b-installer_do_install';
    }

    if (CONF.NON_REMOVABLE_SNAP_TYPES.indexOf(type) === -1 &&
        (status === CONF.INSTALL_STATE.INSTALLED ||
         status === CONF.INSTALL_STATE.ACTIVE)) {
      installHTMLClass = 'b-installer_do_remove';
    }

    if (status === CONF.INSTALL_STATE.INSTALLING) {
      installHTMLClass = 'b-installer_do_install b-installer_thinking';
    }

    if (status === CONF.INSTALL_STATE.REMOVING) {
      installHTMLClass = 'b-installer_do_remove b-installer_thinking';
    }

    return model.set('installHTMLClass', installHTMLClass);
  },

  setInstallActionString: function(model) {
    var status = model.get('status');
    var action;

    switch (status) {
      case CONF.INSTALL_STATE.PRICED:
        action = model.get('price');
        break;
      case CONF.INSTALL_STATE.ACTIVE:
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
    var status = model.get('status');
    var installButtonClass;

    switch (status) {
      case CONF.INSTALL_STATE.ACTIVE:
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
    var state = response.state;
    var type = response.type;
    var id  = response.id;

    if (state) {
      var status = state.status;

      response.status = status;

      response.task_summary = state.task_summary;

      if (state.local_size > 0) {
        response.download_progress =
          Math.floor((Number(state.local_size) / Number(response.download_size)) * 100);
      }
    }

    response.isInstalled = false;
    if (
      status === CONF.INSTALL_STATE.INSTALLED ||
      status === CONF.INSTALL_STATE.ACTIVE ||
      status === CONF.INSTALL_STATE.REMOVING
    ) {
      response.isInstalled = true;
    }

    if (response.hasOwnProperty('icon') && !response.icon.length) {
      response.icon = this.defaults.icon;
    }

    if (status === CONF.INSTALL_STATE.PRICED) {
      response.isInstallable = true;
      response.priced = true;
    }

    response.isCoreSnap = false;
    if (type) {
      if (_.contains(CONF.NON_INSTALLABLE_TYPES, type) ||
          _.contains(CONF.NON_REMOVABLE_SNAP_TYPES, type)) {
        response.isInstallable = false;
        response.isCoreSnap = true;
      }
    }

    if (id) {
      if (_.contains(CONF.NON_INSTALLABLE_IDS, id)) {
        response.isInstallable = false;
        response.isCoreSnap = true;
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

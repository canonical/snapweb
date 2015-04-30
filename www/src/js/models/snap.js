// snap.js

var _ = require('lodash');
var Backbone = require('backbone');
var CONF = require('../config.js');

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
  idAttribute: 'name',
  initialize: function() {

    this.on('error', function(model, response, opts) {
      var httpStatus = opts.xhr.status;
    });

    this.on('sync', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;

      if (status === 202 ||
          status === CONF.INSTALL_STATE.INSTALLING ||
          status === CONF.INSTALL_STATE.UNINSTALLING) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }
    });

    this.on('change:status', function(model) {
      var state = model.get('status');
      var msg = model.get('installMsg');

      switch (state) {
        case CONF.INSTALL_STATE.INSTALLED:
          msg = 'Uninstall';
          break;
        case CONF.INSTALL_STATE.INSTALLING:
          msg = 'Installing';
          break;
        case CONF.INSTALL_STATE.UNINSTALLED:
          msg = 'Install';
          break;
        case CONF.INSTALL_STATE.UNINSTALLING:
          msg = 'Uninstalling';
          break;
      }

      this.set('installMsg', msg);
    });

    this.on('change:icon', function(model) {
      var icon = model.get('icon');

      if (!icon) {
        model.unset('icon');
      }
    });
  },

  parse: function(response) {
    if (response.hasOwnProperty('icon') && !response.icon.length) {
      response.icon = this.defaults.icon;
    }
    return response;
  },

  defaults: {
    installMsg: 'Install',
    icon: '/public/images/default-package-icon.svg'
  }
});

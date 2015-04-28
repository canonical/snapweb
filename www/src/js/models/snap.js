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

    this.on('add sync', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;

      if (status === 202 ||
          status === CONF.INSTALL_STATE.INSTALLING ||
          status === CONF.INSTALL_STATE.UNINSTALLING) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      } else if (status === 400) {
        console.log(400);
        console.log(response);
      } else if (status === 404) {
        console.log(404);
        console.log(response);
      }

      model.setInstallActionString(model);

    });

    this.on('error', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;
      model.set({
        'status': model.previous('status'),
        'isError': true,
        'message': response.statusText
      });
    });

    this.on('change:status', this.setInstallActionString);
  },

  setInstallActionString: function(model) {
    var state = model.get('status');
    var action = model.get('installActionString');

    switch (state) {
      case CONF.INSTALL_STATE.INSTALLED:
        action = 'Uninstall';
        break;
      case CONF.INSTALL_STATE.INSTALLING:
        action = 'Installing';
        break;
      case CONF.INSTALL_STATE.UNINSTALLED:
        action = 'Install';
        break;
      case CONF.INSTALL_STATE.UNINSTALLING:
        action = 'Uninstalling';
        break;
      default:
        // has the effect of hiding the install button in the view,
        // as we have an indeterminate state
        action = false;
    }

    return model.set('installActionString', action);
  },

  defaults: {
    installActionString: false
  }

});

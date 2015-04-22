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
  initialize: function() {

    this.on('error', function(model, response, opts) {
      var httpStatus = opts.xhr.status;
    });

    this.on('sync', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;

      console.log(status);

      if (status === 202 ||
          status === CONF.INSTALL_STATE.INSTALLING || 
          status === CONF.INSTALL_STATE.UNINSTALLING) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }
    });

    this.on('change:status', function(model) {
      var status = model.get('status');
      var msg = 'Oops.';

      switch (status) {
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
        case CONF.INSTALL_STATE.ERROR:
          // TODO handle error
          break;
        case CONF.INSTALL_STATE.UNKNOWN:
          // TODO ???
          msg = '';
          break;
      }

      this.set('install_msg', msg);
    });
  },

  defaults: {
    install_msg: 'Install'
  }


});

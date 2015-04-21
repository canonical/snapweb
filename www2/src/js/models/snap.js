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
      console.log('got a sync error on Snap model');
    });

    this.on('sync', function(model, response, opts) {
      var HttpStatus = opts.xhr.status;
      /** 
      * Backbone throws 202 to the error handler.
      * Respond to 202's with a fetch, repeat until 200
      */
      if (HttpStatus === 202) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }
    });

    this.on('change:status', function(model) {
      var status = model.get('status');
      var msg = '';

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
      }

      this.set('install_msg', msg);
    });
  },

  defaults: {
    install_msg: 'Install'
  }


});

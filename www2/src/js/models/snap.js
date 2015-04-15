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

    /** 
     * Backbone throws 202 to the error handler.
     * Respond to 202's with a fetch, repeat until 200
     */
    this.on('error', function(model, response, opts) {
      if (response.status == 202) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }
    });

    this.on('change:status', function(model) {
      var status = model.get('status');
      var msg = '';

      switch (status) {
        case 'installed':
          msg = 'Uninstall';
          break;
        case 'uninstalled':
          msg = 'Install';
          break;
        case 'installing':
          msg = 'Installing';
          break;
        case 'uninstalling':
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

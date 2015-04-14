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
  // event handler to check the installed attr, or the
  // http status, and refresh GET until state settles on a past tense.
  // retry count?
    this.on('sync', function(model, attrs, opts) {
      if (opts.xhr.status === 202) {
        _.delay(function(model) {
          model.fetch();
        }, 100, model);
      }
    });

    this.on('change:status', function(model) {
      var status = model.get('status');
      var msg = '';

      console.log('status: ', status);

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
  }

});

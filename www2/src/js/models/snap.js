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
  }
});

// snap.js

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}

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

var Snap = module.exports = Backbone.Model.extend({
  urlRoot: '/api/v2/packages'
});

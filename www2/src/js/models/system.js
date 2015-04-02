// system.js
// system settings model

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}

module.exports = Backbone.Model.extend({
  urlRoot: '/api/v1/systemimage/'
});

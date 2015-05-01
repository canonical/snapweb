// system.js
// system settings model

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONFIG = require('../config.js');

module.exports = Backbone.Model.extend({
  urlRoot: CONFIG.SETTINGS
});

// branding.js

var Backbone = require('backbone');
var CONF = require('../config.js');

module.exports = Backbone.Model.extend({
  urlRoot: CONF.BRANDING_DATA,
});

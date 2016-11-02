var Backbone = require('backbone');
var CONF = require('../config.js');

module.exports = Backbone.Model.extend({
  url: CONF.SECTIONS,
});


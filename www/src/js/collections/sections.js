var Backbone = require('backbone');
var Sections = require('../models/sections.js');
var CONF = require('../config.js');

module.exports = Backbone.Collection.extend({
  url: CONF.SECTIONS,
  model: Sections,
});

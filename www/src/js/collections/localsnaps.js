var Backbone = require('backbone');
var LocalSnap = require('../models/localsnap.js');
var CONF = require('../config.js');

module.exports = Backbone.Collection.extend({
  url: CONF.LOCAL_SNAPS,
  model: LocalSnap
});


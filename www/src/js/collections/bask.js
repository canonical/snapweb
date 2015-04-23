// bask.js
// collective noun for group of crocs is a 'bask' :)

var Backbone = require('backbone');
var Snap = require('../models/snap.js');
var CONF = require('../config.js');

module.exports = Backbone.Collection.extend({
  url: CONF.PACKAGES,
  model: Snap
});

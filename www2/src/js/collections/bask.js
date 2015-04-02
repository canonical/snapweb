// bask.js
// collective noun for group of crocs is a 'bask'

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Snap = require('../models/snap.js');

module.exports = Backbone.Collection.extend({
  url: '/api/v2/packages/',
  model: Snap
});

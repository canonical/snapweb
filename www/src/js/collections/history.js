var Backbone = require('backbone');
var LocalSnap = require('../models/localsnap.js');
var $ = require('jquery');
var Backbone = require('backbone');
var CONF = require('../config.js');

module.exports = Backbone.Collection.extend({
  url: CONF.LOCAL_SNAPS,
  model: LocalSnap,

  parse: function(response) {
    return [].concat.apply([], response);
  }
});


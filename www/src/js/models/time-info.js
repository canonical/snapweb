var Backbone = require('backbone');
var Radio = require('backbone.radio');
var CONF = require('../config.js');
var chan = Radio.channel('root');

module.exports = Backbone.Model.extend({

  url: CONF.TIME_INFO,

  initialize: function() {
    this.reallyIsNew = false;
  },

  isNew: function() {
    return !this.reallyIsNew;
  },

  parse: function(response) {
    this.reallyIsNew = true;
    return response;
  }
});


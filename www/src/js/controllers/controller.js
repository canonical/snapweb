var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var Bask = require('../collections/bask.js');

module.exports = {
  app: function(name) {
    console.log('app');
  },

  appSection: function(name, section) {
    console.log('app section');
  }
};

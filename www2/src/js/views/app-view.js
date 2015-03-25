// app-view.js

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

var template = require('../templates/home.hbs');

module.exports = Backbone.View.extend({
  initialize: function() {
  },

  render: function() {
    $('body').prepend('<p>hello</p>');
    return this;
  }
});

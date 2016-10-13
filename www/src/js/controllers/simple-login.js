var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SimpleLoginView = require('../views/simple-login.js');
var SimpleLoginModel = require('../models/simple-login.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var model = new SimpleLoginModel();
    var view = new SimpleLoginView({
      model: model,
    });
    chan.command('set:content', view);
  }
};

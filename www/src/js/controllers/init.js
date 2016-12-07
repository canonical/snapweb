var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var InitLayoutView = require('../views/init.js');
var CreateUserModel = require('../models/create-user.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var model = new CreateUserModel();
    var view = new InitLayoutView({
      model: model,
    });
    chan.command('set:content', {backboneView: view});
  }
};

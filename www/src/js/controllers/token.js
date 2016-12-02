var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var AccessToken = require('../models/token.js');
var SubmitTokenView = require('../views/submit-token.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var model = new AccessToken();
    var view = new SubmitTokenView({
      model: model,
    });
    chan.command('set:content', {backboneView: view});
  }
};

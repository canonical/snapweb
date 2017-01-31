var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var LoginView = require('../views/login.js');
var LoginModel = require('../models/login.js');
var Radio = require('backbone.radio');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');

    var view = new LoginView({
      model: new LoginModel({ }),
    });

    chan.command('set:content', {backboneView: view});
  },
};

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var InitLayoutView = require('../views/init.js');
// var InitModel = require('../models/init.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    // var model = new InitModel();
    console.log('in init.js/index');

    var view = new InitLayoutView({
      // model: model,
    });
    chan.command('set:content', view);
  }
};

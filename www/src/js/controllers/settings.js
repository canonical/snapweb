var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SettingsLayoutView = require('../views/settings.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');

    var view = new SettingsLayoutView();
    chan.command('set:content', view);
  }
};

// root view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/base.hbs');
var chan = Radio.channel('root');

module.exports = Backbone.Marionette.LayoutView.extend({

  initialize: function() {
    console.log('root view');
    chan.comply('render', this.render);
    chan.comply('set:content', this.setContent, this);
  },

  el: '#region-main',

  className: 'webdm',

  template : function() {
    return template();
  },

  setContent: function(content) {
    console.log('root view: setContent');
    this.contentRegion.show(content);
  },

  regions: {
    contentRegion: '.region-content'
  }
});

// main layout view
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var BannerView = require('./layout-banner.js');
var FooterView = require('./layout-footer.js');
var template = require('../templates/layout-main.hbs');
var chan = Radio.channel('root');

module.exports = Marionette.LayoutView.extend({

  initialize: function() {
    chan.comply('set:content', this.setContent, this);
  },

  el: '.b-layout',

  template : function() {
    return template();
  },

  onRender: function() {
    this.showChildView('bannerRegion', new BannerView());
    this.showChildView('footerRegion', new FooterView());
  },

  setContent: function(content) {
    this.mainRegion.show(content);
  },

  regions: {
    bannerRegion: '.b-layout__banner',
    mainRegion: '.b-layout__main',
    footerRegion: '.b-layout__footer'
  }
});

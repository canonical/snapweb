// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var BrandingHeaderView = require("./branding-header.js");
var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  initialize: function(options) {
    this.brandingData = options.brandingData;
  },

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('brandingRegion', new BrandingHeaderView({
      model: this.brandingData
    }));

    // TODO if collection empty use emptyView
    this.showChildView('installedRegion', new SnapListView({
      model: new Backbone.Model({
        title: 'Installed snaps',
        isHomeActive: true,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: false
      }),
      collection: this.collection
    }));
  },

  regions: {
    brandingRegion: '.region-branding-header',
    installedRegion: '.region-installed'
  }
});

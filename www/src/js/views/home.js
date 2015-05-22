// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./snaplist.js');
var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    // TODO if collection empty use emptyView
    this.showChildView('installedRegion', new BaskView({
      collection: this.collection,
      style: 'grid'
    }));
  },

  regions: {
    installedRegion: '.region-installed'
  }
});

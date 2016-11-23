// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    // TODO if collection empty use emptyView
    this.showChildView('installedRegion', new SnapListView({
      model: this.model,
      collection: this.collection
    }));
  },

  regions: {
    installedRegion: '.region-installed'
  }
});

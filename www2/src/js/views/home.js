// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./bask.js');
var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'view-home',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('installedRegion', new BaskView({
      collection: this.collection
    }));
  },

  regions: {
    installedRegion: '.region-installed'
  }
});

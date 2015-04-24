// store layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./snaplist.js');
var template = require('../templates/store.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'store',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('productRegion', new BaskView({
      collection: this.collection,
      rowStyle: true 
    }));
  },

  regions: {
    productRegion: '.region-product'
  }
});

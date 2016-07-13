// store layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var StorelistView = require('./storelist.js');
var template = require('../templates/store.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('store', new StorelistView({
      model: new Backbone.Model({
        title: 'Available snaps',
        isHomeActive: false,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: false
      }),
      collection: this.collection
    }));
  },

  regions: {
    store: '.region-snaplist'
  }
});

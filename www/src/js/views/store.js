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
        title: 'Featured snaps',
        isHomeActive: false,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: true
      }),
      collection: this.collection.all()
    }));
  },

  regions: {
    store: '.region-snaplist'
  }
});

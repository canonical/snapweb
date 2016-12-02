// store layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SearchBarView = require('./search-bar.js');
var StorelistView = require('./storelist.js');
var StoreHeaderView = require('./store-header.js');
var template = require('../templates/store.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  initialize: function(options) {
    var model = options.model;
    var collection = options.collection;
    var self = this;

    var showSearchHeaderView = function() {
      self.showChildView('storeHeader', new StoreHeaderView({
        model: model,
        collection: model.sections
      }));
    };
    var showSnapListView = function() {
      self.showChildView('storeSnapItemsList', new StorelistView({
        model: model,
        collection: collection.all()
      }));
    };
    options.sectionsPromise
           .done(showSearchHeaderView)
           .fail(showSearchHeaderView);
    options.storePromise
           .done(showSnapListView)
           .fail(showSnapListView);
  },

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    this.showChildView('searchBar', new SearchBarView({
      model: this.model
    }));
  },

  regions: {
    searchBar: '.region-search-bar',
    storeHeader: '.region-store-header',
    storeSnapItemsList: '.region-snaplist',
  }
});

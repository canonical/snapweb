// store layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SearchBarView = require('./search-bar.js');
var StorelistView = require('./storelist.js');
var template = require('../templates/store.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  initialize: function(options) {
    this.model = options.model;
    this.collection = options.collection;
    this.sectionsPromise = options.sectionsPromise;
    this.storePromise = options.storePromise;
  },

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    var self = this;
    var showSearchHeaderView = function() {
      self.showChildView('searchBar', new SearchBarView({
        model: self.model,
        collection: self.model.get('sections')
      }));
    };
    var showSnapListView = function() {
      self.showChildView('storeSnapItemsList', new StorelistView({
        model: self.model,
        collection: self.collection.all()
      }));
    };

    this.sectionsPromise
           .done(showSearchHeaderView)
           .fail(showSearchHeaderView);
    this.storePromise
           .done(showSnapListView)
           .fail(showSnapListView);
  },

  regions: {
    searchBar: '.region-search-bar',
    storeSnapItemsList: '.region-snaplist',
  }
});

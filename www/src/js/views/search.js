// search layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./storelist.js');
var SearchBarView = require('./search-bar.js');
var template = require('../templates/search.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  initialize: function(options) {
    this.sectionsPromise = options.sectionsPromise;
  },

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    // TODO refactor with store.js
    var self = this;
    var showSearchHeaderView = function() {
      self.showChildView('searchBarRegion', new SearchBarView({
        model: self.model,
        collection: self.model.get('sections')
      }));
    };
    this.sectionsPromise
           .done(showSearchHeaderView)
           .fail(showSearchHeaderView);

    if (this.collection && this.collection.length >= 1) {
      this.showChildView('resultsRegion', new BaskView({
        model: this.model,
        collection: this.collection
      }));
    }
  },

  regions: {
    searchBarRegion: '.region-search-bar',
    resultsRegion: '.region-results',
  }
});

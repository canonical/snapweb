// search layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./storelist.js');
var SearchBarView = require('./search-bar.js');
var MatchedSnapResultView = require('./search-header-snap-item.js')
var template = require('../templates/search.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  initialize: function(options) {
    this.matchedSnap = options.matchedSnap
  },

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    this.showChildView('searchBarRegion', new SearchBarView({
      model: this.model,
    }));

    if (this.matchedSnap) {
      this.showChildView('matchedSnapResultRegion', new MatchedSnapResultView({
        model: this.matchedSnap
      }));
    }

    if (this.collection && this.collection.length > 1) {
      this.showChildView('resultsRegion', new BaskView({
        model: this.model,
        collection: this.collection
      }));
    }
  },

  regions: {
    searchBarRegion: '.region-search-bar',
    matchedSnapResultRegion: '.region-matched-snap-result',
    resultsRegion: '.region-results',
  }
});

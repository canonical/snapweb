// search layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./snaplist.js');
var template = require('../templates/search.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'search',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('resultsRegion', new BaskView({
      collection: this.collection
    }));
  },

  regions: {
    resultsRegion: '.region-results'
  }
});

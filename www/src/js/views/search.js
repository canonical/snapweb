// search layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./snaplist.js');
var template = require('../templates/search.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    this.showChildView('resultsRegion', new BaskView({
      model: new Backbone.Model({
        title: 'Search results',
        query: this.model.get('query'),
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
    resultsRegion: '.region-results'
  }
});

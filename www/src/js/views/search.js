// search layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var BaskView = require('./storelist.js');
var template = require('../templates/search.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-store',

  template : function(model) {
    return template(model);
  },

    onBeforeShow: function() {
        console.log('dddd')
        console.log(this.limits.searchSnapItemLimit)
      console.log(this.collection.first(this.limits.searchSnapItemLimit))
    this.showChildView('resultsRegion', new BaskView({
      model: new Backbone.Model({
        title: 'Search results',
        query: this.model.get('query'),
        isHomeActive: false,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: true
      }),
      collection: this.collection
    }));
  },

  regions: {
    resultsRegion: '.region-results'
  }
});

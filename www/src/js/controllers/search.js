var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SearchLayoutView = require('../views/search.js');
var Bask = require('../collections/snaplist.js');

module.exports = {
  query: function(q) {
    var chan = Radio.channel('root');
    var searchBask = new Bask();

    // TODO impose the limit before the query
    // not at display time
    searchBask.fetch({
      data: $.param({
        'q': q
      }),
      success: function(snaplist) {
        var match = snaplist.where({'name': q})

        var view =  new SearchLayoutView({
          model: new Backbone.Model({
            query: q,
            title: 'Search results for "' + q  + '"',
            isGrid: true,
            isAlpha: true,
            canSort: false,
            canStyle: true,
            isHomeActive: false,
          }),
          collection: snaplist.length === 1 ? null : snaplist,
          matchedSnap: match.length === 1 ? match[0] : null,
        });
        chan.command('set:content', view);
      }
    });
  }
};

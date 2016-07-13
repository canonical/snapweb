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

    searchBask.fetch({
      data: $.param({
        'q': q
      }),
      success: function(snaplist) {
        var view =  new SearchLayoutView({
          model: new Backbone.Model({
            query: q
          }),
          collection: snaplist
        });
        chan.command('set:content', view);
      }
    });
  }
};

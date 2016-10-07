var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Bask = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var storeSnaplist = new Bask();

    storeSnaplist.fetch({
      data: $.param({
        'featured_only': true
      }),
      success: function(snaplist) {
        var view =  new StoreLayoutView({
          model: new Backbone.Model({
            query: '',
            title: 'Featured snaps',
            isGrid: true,
            isAlpha: true,
            canSort: false,
            canStyle: true,
            isHomeActive: false,
          }),
          collection: snaplist.all()
        });

        chan.command('set:content', view);
      }
    });
  }
};

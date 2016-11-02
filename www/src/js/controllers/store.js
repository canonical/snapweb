var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Sections = require('../collections/sections.js');
var Bask = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var sections = new Sections();
    var storeSnaplist = new Bask();

    $.when(
          storeSnaplist.fetch({ data: $.param({ 'featured_only': true }) })
//          , sections.fetch()
        ).then(function() {
        var view =  new StoreLayoutView({
          model: new Backbone.Model({
            query: '',
            title: 'Featured snaps',
            isGrid: true,
            isAlpha: true,
            canSort: false,
            canStyle: true,
            isHomeActive: false,
            sections: sections
          }),
          collection: storeSnaplist.all()
        });

        chan.command('set:content', view);
      });
  }
};

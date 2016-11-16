var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Sections = require('../collections/sections.js');
var Snaplist = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var sections = new Sections();
    var storeSnaplist = new Snaplist();

    $.when(
          storeSnaplist.fetch({ data: $.param({ 'featured_only': true }) })
          , sections.fetch()
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
  },
  section: function(s) {
    var chan = Radio.channel('root');
    var sections = new Sections();
    var storeSnaplist = new Snaplist();

    // Special case for private section which is not a section
    // per se but a specificity of a snap
    if (s === 'private') {
      $.when(
        storeSnaplist.fetch()
      ).then(function() {
        var view =  new StoreLayoutView({
          model: new Backbone.Model({
            query: '',
            title: 'Private',
            isGrid: true,
            isAlpha: true,
            canSort: false,
            canStyle: true,
            isHomeActive: false,
            sections: sections
          }),
          collection: storeSnaplist.private()
        });

        chan.command('set:content', view);
      });
    }
    else {
      $.when(
        storeSnaplist.fetch({ data: $.param({ 'section': s }) })
      ).then(function() {
        var view =  new StoreLayoutView({
          model: new Backbone.Model({
            query: '',
            title: s,
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
  }
};

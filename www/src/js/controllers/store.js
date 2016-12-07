var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var React = require('react');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Snaplist = require('../collections/snaplist.js');
var Sections = require('../common/sections.js');
var SnaplistTools = require('../common/snaplists.js');

var fetchSnapList = function(title, options) {
  var chan = Radio.channel('root');
  var storeSnaplist = new Snaplist();
  var sections = [];

  var displayStoreView = function(sections, storeSnapList) {
    var element = React.createElement(StoreLayoutView, {
      model: new Backbone.Model({
        query: '',
        title: title,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: true,
        isHomeActive: false,
        sections: sections
      }),
      collection: storeSnaplist
    });
    chan.command('set:content', {reactElement: element});
  }

  var sp = $.Deferred(function(deferred) {
    Sections.fetch().then(function(response) {
      sections = response;
    }).always(deferred.resolve);
  });

  var ssp = $.Deferred(function(deferred) {
    storeSnaplist.fetch(options).always(deferred.resolve);
  });

  $.when(sp, ssp).done(function() {
    displayStoreView(sections, SnaplistTools.updateInstalledStates(storeSnaplist));
  });
}

module.exports = {
  index: function() {
    fetchSnapList('Featured snaps')
  },
  section: function(s) {
    // Special case for private section which is not a section
    // per se but a specificity of a snap
    if (s === 'private') {
      fetchSnapList('Private snaps', {data: $.param({'private_snaps': true})})
    }
    else {
      fetchSnapList(s, {data: $.param({'section': s})})
    }
  }
};

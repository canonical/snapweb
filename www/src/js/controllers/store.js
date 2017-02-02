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


function isDiffArray(arr1, arr2) {
  if (arr1.length != arr2.length)
    return true;

  for (var i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i])
      return true;
  }

  return false;
}

var fetchSnapList = function(title, options) {
  var chan = Radio.channel('root');
  var storeSnaplist = new Snaplist();
  var sections = [];

  if (localStorage) {
    sections = JSON.parse(localStorage.getItem('storeSections')) || [];
  }

  var storeModel = new Backbone.Model({
        query: '',
        title: title,
        isGrid: true,
        isAlpha: true,
        canSort: false,
        canStyle: true,
        isHomeActive: false,
        sections: sections.concat('private'),
        loading: true
      });

  var element = React.createElement(StoreLayoutView, {
    model: storeModel,
    collection: storeSnaplist
  });
  chan.command('set:content', {reactElement: element});

  Sections.fetch().done(function(response) {
      if (isDiffArray(sections, response)) {
        if (localStorage) {
          localStorage.setItem('storeSections', JSON.stringify(response));
        }
        storeModel.set('sections', response.concat('private'));
      }
    });

  storeSnaplist.fetch(options).always(function(response) {
    storeModel.set('loading', false);
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

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var React = require('react');
var Radio = require('backbone.radio');
var Snaplist = require('../collections/snaplist.js');
var Sections = require('../common/sections.js');
var StoreLayoutView = require('../views/store.js');
var CONF = require('../config.js');

function isDiffArray(arr1, arr2) {
  if (arr1.length != arr2.length)
    return true;

  for (var i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i])
      return true;
  }
  return false;
}

var updateInstalledStates = function(collection) {
  if (!collection) {
    return;
  }
  var installedBask = new Snaplist();
  installedBask.fetch({
    data: $.param({
      'installed_only': true
    }),
    success: function(snaplist) {
      var installedById = {}
      snaplist.forEach(function(s) {
        installedById[s.id] = s
      })
      collection.forEach(function(s) {
        if (installedById[s.id]) {
          // TODO make sure that active & installed state is preserved
          s.set('status', CONF.INSTALL_STATE.INSTALLED)
          s.set('icon', installedById[s.id].get('icon'))
        }
      });
    },
    error: function(snaplist) {
      console.log('error')
    }
  });
  return collection
};

module.exports = {
  fetchSnapListView: function(title, query, options) {
    var chan = Radio.channel('root');
    var snaplist = new Snaplist();
    var sections = [];

    if (localStorage) {
      sections = JSON.parse(localStorage.getItem('storeSections')) || [];
    }

    var m = new Backbone.Model({
      query: query,
      title: title,
      isGrid: true,
      isHomeActive: false,
      sections: sections.concat('private'),
      loading: true
    });

    var element = React.createElement(StoreLayoutView, {
      model: m,
      collection: snaplist
    });
    chan.command('set:content', {reactElement: element});

    Sections.fetch().done(function(response) {
      if (isDiffArray(sections, response)) {
        if (localStorage) {
          localStorage.setItem('storeSections', JSON.stringify(response));
        }
        m.set('sections', response.concat('private'));
      }
    });

    snaplist.fetch(options).always(function(response) {
      m.set('loading', false);
    }).done(function() {
      snaplist = updateInstalledStates(snaplist)
    });
  },
  updateInstalledStates: updateInstalledStates,
};

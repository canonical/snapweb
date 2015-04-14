// bask view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapItemView = require('../views/snap-item.js');
var EmptyInstalledView = require('./empty-installed-bask.js');
var CONF = require('../config.js');

module.exports = Marionette.CollectionView.extend({

  className: 'list--apps',

  tagName: 'ul',

  childView: SnapItemView,

  emptyView: EmptyInstalledView,

  // TODO config
  filter: function(child, index, collection) {
    var name = child.get('name');
    CONF.FILTERED_SNAPS.forEach(function(excluded) {
      if (name === excluded) {
        return false;
      }
    });
    return true;
  }
});

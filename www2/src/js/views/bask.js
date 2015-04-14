// bask view
var _ = require('lodash');
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
    /**
    return CONF.FILTERED_SNAPS.forEach(function(excluded) {
      return (name === excluded) ? true : false;
    });
    **/

    return !_.some(CONF.FILTERED_SNAPS, function(filtered) {
      return filtered === name;
    });
  }
});

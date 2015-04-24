// snaplist view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnaplistItemView = require('../views/snaplist-item.js');
var EmptySnaplistView = require('./empty-snaplist.js');
var CONF = require('../config.js');

module.exports = Marionette.CollectionView.extend({

  className: function() {
    var style = this.options.style || 'row';

    if (style === 'row') {
      return 'b-snaplist b-snaplist--row';
    } else if (style === 'grid') {
      return 'b-snaplist b-snaplist--grid';
    }
  },

  childView: SnaplistItemView,

  emptyView: EmptySnaplistView,

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

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

  emptyView: EmptySnaplistView

});

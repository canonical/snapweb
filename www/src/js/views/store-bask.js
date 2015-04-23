// store bask view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var StoreItemView = require('../views/store-bask-snap.js');

module.exports = Marionette.CollectionView.extend({
  className: 'search-results__list',
  tagName: 'ul',
  childView: StoreItemView,
});

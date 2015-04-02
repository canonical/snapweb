// bask view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapItemView = require('../views/snap-item.js');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}

module.exports = Marionette.CollectionView.extend({
  className: 'bask',
  childView: SnapItemView,
});

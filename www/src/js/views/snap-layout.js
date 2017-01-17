// snap layout view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Handlebars = require('hbsfy/runtime');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');

Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));

var SnapInterfaceListItemView = Marionette.ItemView.extend({
  tagName: 'li',
  template: _.template('<%= name %>'),
});

var SnapInterfaceCollectionView = Marionette.CollectionView.extend({
  childView: SnapInterfaceListItemView,
  tagName: 'ul',
});

module.exports = Marionette.LayoutView.extend({
  className: 'b-snap',

  initialize: function() {
    this.model.on('change:download_progress',this.render)
  },

  template: function(model) {
    /**
     * use pretty-bytes on size, when available
     * https://www.npmjs.com/package/pretty-bytes
     *
     * mode.size_human = prettyBytes(model.size)
    **/
    return template(model);
  },

  behaviors: {
    InstallBehavior: {
      behaviorClass: InstallBehavior
    }
  },

  onBeforeShow: function() {
    this.showChildView(
        'interfacesRegion',
        new SnapInterfaceCollectionView({
          model: this.model,
          collection: this.collection
        })
    );
  },

  onShow: function() {
    window.scrollTo(0, 0);
  },

  regions: {
    interfacesRegion: '#interface-list',
  },
});

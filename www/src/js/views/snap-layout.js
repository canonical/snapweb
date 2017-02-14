// snap layout view
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Handlebars = require('hbsfy/runtime');
var InstallBehavior = require('../behaviors/install.js');
var EnableBehavior = require('../behaviors/enabler.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');

// Handles the install/remove button
Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));
// Handles the enable/disable button
Handlebars.registerPartial('enabler', require('../templates/_enabler.hbs'));

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
    var self = this;
    this.model.on('change:download_progress', function() {
      $("#progressbarwrapper").css({'background-color': 'LightGray'});
      $("#progress").css('width', self.model.get("download_progress")+"%");
    });
    this.model.on('change:task_summary', function() {
      $("#tasksummary").text(self.model.get("task_summary"));
    })
    this.model.on('change:status', function() {
      var status = self.model.get('status');
      if (status !== CONF.INSTALL_STATE.INSTALLING) {
        $("#progressbarwrapper").css({'background-color': ''});
      }
    })
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
    },
    EnableBehavior: {
      behaviorClass: EnableBehavior
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

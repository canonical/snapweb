// system settings layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SettingsView = require('./settings.js');
var BaskView = require('./bask.js');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var template = require('../templates/system.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'view-system',

  template : function() {
    return template();
  },

  onBeforeShow: function() {
    this.showChildView('systemSettingsRegion', new SettingsView({
      model: this.model
    }));
    this.showChildView('installedRegion', new BaskView({
      collection: this.collection
    }));
  },

  regions: {
    systemSettingsRegion: '.region-system-settings',
    installedRegion: '.region-installed'
  }

});

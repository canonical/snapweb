// system settings layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SettingsView = require('./settings.js');
var BaskView = require('./snaplist.js');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var template = require('../templates/system.hbs');

module.exports = Marionette.LayoutView.extend({

  template : function(model) {
    return template(model);
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

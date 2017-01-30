// settings view
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/settings.hbs');
var SettingsDeviceView = require('./settings-device.js');
var SettingsProfileView = require('./settings-profile.js');
var SettingsUsersView = require('./settings-users.js');
var SettingsUpdatesView = require('./settings-updates.js');
var SettingsTimeView = require('./settings-time.js');

module.exports = Backbone.Marionette.LayoutView.extend({
  initialize: function(options) {
    this.timeInfo = options.timeInfo;
    this.deviceInfo = options.deviceInfo;
    this.userProfile = options.userProfile;
    this.defaultPage = options.defaultPage;
  },

  template: function(model) {
    return template(model);
  },

  ui: {
    'row': '.js-list-item'
  },

  events: {
    'click @ui.row': 'handleSectionActivation'
  },

  regions: {
    contentRegion: '.b-settings__content'
  },

  showContent: function(id) {
    var view;
    switch (id) {
      case 'profile':
        view = new SettingsProfileView({
          model: this.userProfile
        });
        break;
      case 'users':
        view = new SettingsUsersView();
        break;
      case 'updates':
        view = new SettingsUpdatesView();
        break;
      case 'time':
        view = new SettingsTimeView({
          model: this.timeInfo
        });
        break;
      case 'device':
      default:
        view = new SettingsDeviceView({
          model: this.deviceInfo
        });
    }

    this.showChildView('contentRegion', view);
  },

  handleSectionActivation: function(e) {
    this.setSectionAsActive(e.target.getAttribute('id'));
  },

  setSectionAsActive: function(id) {
    this.showContent(id);
    this.$('.js-list-item').removeClass('is-active');
    this.$('#' + id).addClass('is-active');
  },

  onBeforeShow: function() {
    this.setSectionAsActive(this.defaultPage);
  }
});

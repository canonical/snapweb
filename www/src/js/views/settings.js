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
  },

  template: function(model) {
    return template(model);
  },

  ui: {
    'row': '.js-list-item'
  },

  events: {
    'click @ui.row': 'setActive'
  },

  regions: {
    contentRegion: '.b-settings__content'
  },

  showContent: function(id) {
    var view;
    switch (id) {
      case 'profile':
        view = new SettingsProfileView();
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

  setActive: function(e) {
    var id = e.target.getAttribute('id');
    this.showContent(id);
    this.$('.js-list-item').removeClass('is-active');
    this.$('#' + id).addClass('is-active');
  },

  onBeforeShow: function() {
    this.showContent('device');
  }
});

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
    this.profileModel = options.profileModel;
  },

  template: function(model) {
    return template(model);
  },

  ui: {
    'row': '.b-settings__row'
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
        view = new SettingsProfileView({
          model: this.profileModel
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

    this.$('.b-settings__row').removeClass('b-settings__row_active');
    this.$('#' + id).addClass('b-settings__row_active');

    this.showChildView('contentRegion', view);
  },

  setActive: function(e) {
    var id = e.target.getAttribute('id');
    this.showContent(id);
  },

  onBeforeShow: function() {
    this.showContent('device');
  }
});

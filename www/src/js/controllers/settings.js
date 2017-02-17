var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SettingsLayoutView = require('../views/settings.js');
var TimeInfo = require('../models/time-info.js');
var DeviceInfo = require('../models/device-info.js');
var UserProfile = require('../models/user-profile.js');

module.exports = {
  page: function(p) {
    this.index(p)
  },
  index: function(page) {
    var chan = Radio.channel('root');
    var timeInfo = new TimeInfo;
    var deviceInfo = new DeviceInfo;
    var userProfile = new UserProfile;

    page = page || 'device'

    $.when(
          timeInfo.fetch(),
          deviceInfo.fetch(),
          userProfile.fetch()
        ).then(function() {
          var view = new SettingsLayoutView({
                  timeInfo: timeInfo,
                  deviceInfo: deviceInfo,
                  userProfile: userProfile,
                  defaultPage: page,
                });
          chan.command('set:content', {backboneView: view});
        });
  }
};


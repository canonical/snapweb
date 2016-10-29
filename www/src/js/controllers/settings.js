var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SettingsLayoutView = require('../views/settings.js');
var TimeInfo = require('../models/time-info.js');
var DeviceInfo = require('../models/device-info.js');
var sharedProfileModel = require('../models/profile.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var timeInfo = new TimeInfo;
    var deviceInfo = new DeviceInfo;

    $.when(
          timeInfo.fetch(),
          deviceInfo.fetch()
        ).then(function() {
          var view = new SettingsLayoutView({
                  timeInfo: timeInfo,
                  deviceInfo: deviceInfo
                });
          chan.command('set:content', view);
        });

    var timeInfo = new TimeInfo();
    
    $.when(
      timeInfo.fetch()
    ).then(function() {
      var view = new SettingsLayoutView({
          timeInfo: timeInfo,
          profileModel: sharedProfileModel
      });
      chan.command('set:content', view);
    });

    var profileModel = new ProfileModel;
  },

};


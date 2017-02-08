var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SettingsLayoutView = require('../views/settings.js');
var TimeInfo = require('../models/time-info.js');
var DeviceInfo = require('../models/device-info.js');
var Updates = require('../collections/localsnaps.js');
var History = require('../collections/history.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var timeInfo = new TimeInfo;
    var deviceInfo = new DeviceInfo;
    var updates = new Updates;
    var history = new History;

    $.when(
          timeInfo.fetch(),
          deviceInfo.fetch(),
          updates.fetch({
                    data: $.param({
                      'updatable_only': true
                    })
                  }),
          history.fetch({
                    data: $.param({
                      'history': 1
                    })
                  })
        ).then(function() {
          var view = new SettingsLayoutView({
                  timeInfo: timeInfo,
                  updates: updates,
                  history: history
                });
          chan.command('set:content', {backboneView: view});
        });
  }
};


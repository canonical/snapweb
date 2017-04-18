var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Radio = require('backbone.radio');
var Snap = require('../models/snap.js');
var HomeLayoutView = require('../views/home.js');
var React = require('react')
var ReactBackbone = require('react.backbone');
var Config = require('../config.js');

var SnapList = require('../collections/snaplist.js');
var DeviceInfo = require('../models/device-info.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var trackedSnapList = new SnapList();
    var installedSnapList = new SnapList();
    var deviceInfo = new DeviceInfo();

    $.when(
      trackedSnapList.fetch({ data: $.param({ 'tracked_snaps': true })}),
      installedSnapList.fetch({ data: $.param({ 'installed_only': true })}),
      deviceInfo.fetch()
    ).then(function() {
      trackedSnapList = new Backbone.Collection(trackedSnapList.filter(function(s) {
        return s.get('status') === Config.INSTALL_STATE.INSTALLING;
      }));
      installedSnapList.add(trackedSnapList.toJSON(), {silent : true});

      var c = new Backbone.Collection(
        trackedSnapList.toJSON().concat(
          installedSnapList.toJSON()
        )
      );
      var installedSnapsView = React.createElement(HomeLayoutView, {
        model: new Backbone.Model({}),
        collection: c,
        deviceInfo: deviceInfo
      });
      chan.command('set:content', {reactElement: installedSnapsView});
    });
  },
};

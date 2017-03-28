var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var _ = require('lodash');
var Radio = require('backbone.radio');
var React = require('react');
var SnapDetailsView = require('../components/snap-details.js');
var DeviceInfo = require('../models/device-info.js');
var Snap = require('../models/snap.js');
var SnapTools = require('../common/snaps.js')

var snapChannel = Radio.channel('snap');
var rootChannel = Radio.channel('root');

var byteSizeToString = function(s) {
  var suffixes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  for (var i in suffixes) {
    if (s < 1000) {
      return s.toFixed(2) + suffixes[i];
    }
    s /= 1000;
  }
  return s;
};

var showSnapView = function(snap, deviceInfo) {
  var size = snap.get('installed_size')
      || snap.get('download_size');
  snap.set('size', byteSizeToString(parseInt(size)));

  var element = React.createElement(SnapDetailsView, {
    model: snap,
    collection: new Backbone.Collection(deviceInfo.get('interfaces'))
  });
  rootChannel.command('set:content', {reactElement: element});
};

module.exports = {
  snap: function(id) {
    var snap = new Snap({id: id});
    var deviceInfo = new DeviceInfo();

    $.when(
      snap.fetch(),
      deviceInfo.fetch()
    ).then(function() {
      showSnapView(snap, deviceInfo);
    });
  }
};

snapChannel.comply('show', function(model) {
  var deviceInfo = new DeviceInfo();

  var c = function(snapModel, interfaces) {
    var name = snapModel.get('id');
    if (!name) {
      return
    }
    showSnapView(snapModel, deviceInfo);

    var url = 'snap/' + name;
    Backbone.history.navigate(url);
  };

  deviceInfo.fetch({
    success: function(di) {
      c(di.get('interfaces'));
    },
    error: function() {
      console.log('Could not retrieve interfaces for snap details');
      c([]);
    }
  });
});

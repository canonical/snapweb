var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var _ = require('lodash');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SnapLayoutView = require('../views/snap-layout.js');
var DeviceInfo = require('../models/device-info.js');
var Snap = require('../models/snap.js');
var SnapTools = require('../common/snaps.js')

var snapChannel = Radio.channel('snap');
var rootChannel = Radio.channel('root');

var collectionFromInterfaces = function(interfaces) {
  interfaces = interfaces || ''
  var c = _.map(
      interfaces.split(','),
      function(v) { return {id: v, name: v} });
  return new Backbone.Collection(c)
};

var byteSizeToString = function(s) {
  var suffixes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  for (i in suffixes) {
    if (s < 1000) {
      return s.toFixed(2) + suffixes[i];
    }
    s /= 1000;
  }
  return s;
}

module.exports = {
  snap: function(id) {
    var snap = new Snap({id: id});
    var deviceInfo = new DeviceInfo();

    $.when(
      snap.fetch(),
      deviceInfo.fetch()
    ).then(function() {
      // TODO remove size hack (to deal w/ installed vs store snap)
      var size = snap.get('installed_size') || snap.get('download_size')
      snap.set('size', byteSizeToString(parseInt(size)))
      var view =  new SnapLayoutView({
        model: snap,
        collection: collectionFromInterfaces(deviceInfo.get('interfaces'))
      });
      rootChannel.command('set:content', view);
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
    var url = 'snap/' + name;
    var view =  new SnapLayoutView({
      model: snapModel,
      collection: collectionFromInterfaces(interfaces)
    });
    rootChannel.command('set:content', view);
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

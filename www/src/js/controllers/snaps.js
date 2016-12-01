var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SnapLayoutView = require('../views/snap-layout.js');
var DeviceInfo = require('../models/device-info.js');
var Snap = require('../models/snap.js');
var SnapTools = require('../common/snaps.js')

var snapChannel = Radio.channel('snap');
var rootChannel = Radio.channel('root');

var collectionFromInterfaces = function(interfaces) {
  return new Backbone.Collection(
      _.map(interfaces ? interfaces : [], function(v) { return {id: val} })
  )
};

module.exports = {
  snap: function(id) {
    var snap = new Snap({id: id});
    var deviceInfo = new DeviceInfo();

    $.when(
      snap.fetch(),
      deviceInfo.fetch()
    ).then(function() {
      var view =  new SnapLayoutView({
        model: snap,
        collection: collectionFromInterfaces(deviceInfo.interfaces)
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
      c(di);
    },
    error: function() {
      console.log('Could not retrieve interfaces for snap details');
      c([]);
    }
  });
});

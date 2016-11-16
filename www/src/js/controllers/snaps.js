var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SnapLayoutView = require('../views/snap-layout.js');
var Snap = require('../models/snap.js');
var SnapTools = require('../common/snaps.js')

var snapChannel = Radio.channel('snap');
var rootChannel = Radio.channel('root');

module.exports = {
  snap: function(id) {
    var snap = new Snap({id: id});

    snap.fetch({
      success: function(snap) {
        var view =  new SnapLayoutView({
          model: snap
        });
        rootChannel.command('set:content', view);
      },
      error: function() {
        // TODO error view
        alert('Model.fetch() failed. :(');
      }
    });
  }
};

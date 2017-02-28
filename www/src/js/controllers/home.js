var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var Snap = require('../models/snap.js');
var HomeLayoutView = require('../views/home.js');
var React = require('react')
var ReactBackbone = require('react.backbone');

var SnapList = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var installedBask = new SnapList();

    installedBask.fetch({
      data: $.param({
        'installed_only': true
      }),
      success: function(snaplist) {
        var c = snaplist.all()

        var installedSnapsView = React.createElement(HomeLayoutView, {
          model: new Backbone.Model({
            title: 'Installed snaps',
            isHomeActive: true,
          }),
          collection: c
        });
        chan.command('set:content', {reactElement: installedSnapsView});
      }
    });
  },
};

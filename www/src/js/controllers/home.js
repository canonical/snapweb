var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var Snap = require('../models/snap.js');
var HomeLayoutView = require('../views/home.js');

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

        var installedSnapsView = new HomeLayoutView({
          model: new Backbone.Model({
            title: 'Installed snaps',
            isHomeActive: true,
          }),
          collection: c
        });

        chan.command('set:content', {backboneView: installedSnapsView});
      },
      error: function() {
	console.log('error')
      }
    });
  },
};

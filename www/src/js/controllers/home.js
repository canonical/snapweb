var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var HomeLayoutView = require('../views/home.js');
var Bask = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var installedBask = new Bask();

    installedBask.fetch({
      data: $.param({
        'installed_only': true
      }),
      success: function(snaplist) {
        var view = new HomeLayoutView({
          collection: snaplist.installed()
        });
        chan.command('set:content', view);
      }
    });
  }
};

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var HomeLayoutView = require('../views/home.js');
var Bask = require('../collections/bask.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var installedBask = new Bask();

    installedBask.fetch({
      data: $.param({
        'types': ['app'],
        'installed_only': true
      }),
      success: function(bask) {
        var view = new HomeLayoutView({
          collection: bask
        });
        chan.command('set:content', view);
      }
    });
  }
};

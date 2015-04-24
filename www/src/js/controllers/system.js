var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SystemLayoutView = require('../views/system.js');
var Bask = require('../collections/snaplist.js');
var SystemModel = require('../models/system.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var installedBask = new Bask();
    var system = new SystemModel();

    // TODO installed snaps snaplist, same as we get for home...
    var options = {
      data: $.param({
        'types': ['app'],
        'installed_only': true
      })
    };

    $.when(
      installedBask.fetch(options),
      system.fetch()).done(function() {

        var view = new SystemLayoutView({
          model: system,
          collection: installedBask
        });
        chan.command('set:content', view);

      }).fail(function() {
        // TODO handle failure
        alert('error, couldn\'t load data');
      });

  }
};

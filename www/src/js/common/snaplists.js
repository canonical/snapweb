var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var CONF = require('../config.js');
var Snaplist = require('../collections/snaplist.js');

module.exports = {
  updateInstalledStates: function(collection) {
    if (!collection) {
      return;
    }
    var installedBask = new Snaplist();
    installedBask.fetch({
      data: $.param({
        'installed_only': true
      }),
      success: function(snaplist) {
        var installedById = {}
        snaplist.forEach(function(s) {
          installedById[s.id] = s
        })
        collection.forEach(function(s) {
          if (installedById[s.id]) {
            // TODO make sure that active & installed state is preserved
            s.set('status', CONF.INSTALL_STATE.INSTALLED)
          }
        });
      },
      error: function(snaplist) {
      }
    });
    return collection
  },
};

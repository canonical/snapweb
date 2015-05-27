var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Snaplist = require('../collections/snaplist.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var storeSnaplist = new Snaplist();

    storeSnaplist.fetch({
      success: function(snaplist) {
        var view =  new StoreLayoutView({
          collection: snaplist
        });
        chan.command('set:content', view);
      }
    });
  }
};

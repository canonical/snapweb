var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var StoreLayoutView = require('../views/store.js');
var Bask = require('../collections/bask.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var storeBask = new Bask();

    storeBask.fetch({
      success: function(bask) {
        var view =  new StoreLayoutView({
          collection: bask
        });
        chan.command('set:content', view);
      }
    });
  }
};

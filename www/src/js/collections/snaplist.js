// snaplist.js
// collective noun for group of crocs is a 'snaplist' :)

var Backbone = require('backbone');
var Snap = require('../models/snap.js');
var CONF = require('../config.js');
var Radio = require('backbone.radio');
var chan = Radio.channel('root');

module.exports = Backbone.Collection.extend({
  url: CONF.PACKAGES,
  model: Snap,
  installed: function() {
    return new this.constructor(this.where({status: 'installed'}));
  },
  comparator: function(model) {
    return model.get('name');
  },
  initialize: function() {
    this.on('error', function(collection, response) {
      if (response.status == 401) {
        chan.command('redirect:sso');
      }
    });
  }
});

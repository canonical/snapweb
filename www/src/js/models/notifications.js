var Backbone = require('backbone');
var Radio = require('backbone.radio');
var CONF = require('../config.js');
var chan = Radio.channel('root');

module.exports = Backbone.Model.extend({

  url: CONF.NOTIFICATION_INFO,

  initialize: function() {
  },

  isNew: function() {
    return true;
  },

  parse: function(response) {
    var notification = {'updatesAvailable': 0};
    if (response !== undefined && Array.isArray(response)) {
      notification.updatesAvailable = response.length;
    }
    return notification;
  }
});

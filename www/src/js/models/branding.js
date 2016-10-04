// branding.js

var Backbone = require('backbone');
var CONF = require('../config.js');

module.exports = Backbone.Model.extend({
  urlRoot: CONF.BRANDING_DATA,

  parse: function(response) {
    if (!response.icon) {
      response.icon = this.defaults.icon
    }
    return response
  },

  defaults: {
    icon: '/public/images/default-package-icon.svg',
  }
});

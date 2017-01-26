var Backbone = require('backbone');
var Cookies = require('js-cookie');
var Config = require('../config.js')

module.exports = Backbone.Model.extend({
  url: '/api/v2/validate-token',

  // forces POST requests on every model update
  isNew: function() {
    return true;
  },

  setCookie: function(token) {
    Cookies.set(Config.SNAPWEB_AUTH_TOKEN_COOKIE_NAME, token);
  },
});

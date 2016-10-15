// create-user API

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Cookies = require("js-cookie");

module.exports = Backbone.Model.extend({
  url: '/api/v2/login',

  // forces POST requests on every model update
  isNew: function() {
    return true;
  },

  validate: function(attrs) {
    var emailPattern = /^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/;
    if (typeof attrs.email == 'undefined') {
      return 'Empty email';
    }
    if (!attrs.email.match(emailPattern)) {
      return 'Invalid email';
    }
    if (typeof attrs.password == 'undefined') {
      return 'Empty password';
    }
  },

  setMacaroonCookiesFromResponse: function(result) {
    // the cookie will expire in 1 /day/
    // unfortunately Chrome's "continue where I left off
    // prevents session cookies to expire as usual
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=130291
    Cookies.set('SM', result, {expires: 1});
  },
  
});

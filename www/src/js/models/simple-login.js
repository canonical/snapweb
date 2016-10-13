// create-user API

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

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
    document.cookie = "SnapwebMacaroon=" + result.macaroon +
      "; path=/; SnapwebDischarge=" + result.discharges[0] + "; path=/";
  },
  
});

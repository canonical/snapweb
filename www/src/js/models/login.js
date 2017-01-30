// Handles login form post
// Encapsulate the logic associated to login

var Backbone = require('backbone');
var Cookies = require('js-cookie');
var Config = require('../config.js')

module.exports = Backbone.Model.extend({
  url: '/api/v2/user-login',

  initialize: function() {
    this.email = '';
    this.password = '';
    this.otp = '';
  },

  // forces POST requests on every model update
  isNew: function() {
    return true;
  },
});


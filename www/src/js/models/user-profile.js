var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONFIG = require('../config.js');

module.exports = Backbone.Model.extend({
  url: CONFIG.USER_PROFILE,

  defaults: {
    username: '',
    email: '',
  }
});

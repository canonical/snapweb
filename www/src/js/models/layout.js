var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONFIG = require('../config.js');

module.exports = Backbone.Model.extend({
  url: CONFIG.USER_PROFILE,

  parse: function(response) {
    var snapweb = window.SNAPWEB;
    var path = window.location.pathname.split('/')[1];

    response.query = window.decodeURI(window.location.search.slice(3)) || '';
    response.name = snapweb.NAME;
    response.subname = snapweb.SUBNAME;
    response.isHomeActive = (path === '');
    response.isStoreActive = (path === 'store' || path === 'search');
    response.isSettingsActive = (path === 'settings');

    return response
  },

  defaults: {
    isAuthenticated: false,
  }
});

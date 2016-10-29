var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-profile.hbs');
var Radio = require('backbone.radio');
var chan = Radio.channel('root');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__profile',

  events: {
    'click @ui.login': 'handleLogin',
    'click @ui.logout': 'handleLogout',
  },

  modelEvents: {
    'change': function() {
      this.render();
    }
  },
  
  ui: {
    login: '.btn-login',
    logout: '.btn-logout',
  },

  handleLogin: function() {
    console.log("login");
  },

  handleLogout: function() {
    this.model.logout();
  },

  template: function(model) {
    return template(model);
  },
  
});

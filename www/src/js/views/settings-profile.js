var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-profile.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__profile',

  events: {
    'click @ui.login': 'handleLogin',
    'click @ui.logout': 'handleLogout',
  },

  ui: {
    login: '.btn-login',
    logout: '.btn-logout',
  },

  handleLogin: function() {
    console.log("login pressed");
    // event.preventDefault();
    this.model.get('secret', {
      success: function() {
        console.log("macaroon success");
      },
      error: function() {
        console.log("macaroon error");
      }
    });
  },

  handleLogout: function() {
    console.log("logout pressed");
  },

  templateContext: function() {
    return {
      isLogggedIn: this.model.email ? true : false
    }
  },
  
  template: function(model) {
    return template(model);
  },
  
});

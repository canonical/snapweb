var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-users.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__users',

  template: function() {
    return template();
  }
});

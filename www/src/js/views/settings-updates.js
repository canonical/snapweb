var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-updates.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__updates',

  template: function() {
    return template();
  }
});

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-time.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__time',

  template: function() {
    return template();
  }
});

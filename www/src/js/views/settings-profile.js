var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-profile.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__profile',

  template: function(model) {
    return template(model);
  }
});

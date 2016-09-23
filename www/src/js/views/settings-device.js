var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-device.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__device',

  template: function(model) {
    return template(model);
  }
});

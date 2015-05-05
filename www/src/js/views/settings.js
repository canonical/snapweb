// settings view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  template: function(model) {
    return template(model);
  },
});

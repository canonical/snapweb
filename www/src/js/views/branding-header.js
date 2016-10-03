// banner layout view
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/branding-header.hbs');

module.exports = Marionette.ItemView.extend({
  className: 'b-branding-header',

  template: function(model) {
    return template(model);
  },
});

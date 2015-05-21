// snap settings view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-settings.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-snap__tab-content',
  template: function() {
    return template();
  },
});

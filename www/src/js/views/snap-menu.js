// snap menu view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-menu.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  template: function() {
    return template();
  },
});

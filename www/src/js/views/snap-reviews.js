// snap reviews view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-reviews.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  template: function() {
    return template();
  },
});

// snap menu view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-menu.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  initialize: function() {
    this.listenTo(this.model, 'change:navigation', this.render);
  },

  className: 'b-snap__navigation',

  template: function(model) {
    return template(model);
  }
});

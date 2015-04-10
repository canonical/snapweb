// snap menu view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-detail.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  template: function(model) {
    return template(model);
  },
});

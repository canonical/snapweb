var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/empty-snaplist.hbs');

module.exports = Marionette.ItemView.extend({
  template: template()
});

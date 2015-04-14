var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/empty-installed-bask.hbs');

module.exports = Marionette.ItemView.extend({
  template: template() 
});

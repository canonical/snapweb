var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/store-section-item.hbs');

module.exports = Marionette.ItemView.extend({

  template: function(model) {
    return template(model);
  },
});

// banner layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/layout-banner.hbs');

module.exports = Marionette.ItemView.extend({

  className: 'b-banner',

  template : function() {
    return template();
  }

});

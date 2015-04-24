// footer layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/layout-footer.hbs');

module.exports = Marionette.ItemView.extend({

  template : function() {
    return template();
  }

});

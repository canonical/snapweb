// footer layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/layout-footer.hbs');

module.exports = Marionette.ItemView.extend({

  template: function(model) {
    return template(model);
  },

  model: new Backbone.Model({
    snapdVersion: window.SNAPWEB.SNAPD_VERSION
  })
});

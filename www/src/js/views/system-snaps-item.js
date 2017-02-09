var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var template = require('../templates/system-snaps-item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',

  template: function(model) {
    return template(model);
  },

  ui: {
    'snapTitle': '#js-snap-title'
  },

  events: {
    'click @ui.snapTitle':  'showSnap'
  },
});

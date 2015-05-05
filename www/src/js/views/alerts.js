// global alerts view
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/alerts.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  className: 'b-alert',

  events: {
    'click @ui.close': 'onClose'
  },

  ui: {
    'close': '.b-alert__close'
  },

  template: function(model) {
    return template(model);
  },

  onClose: function(e) {
    var model = this.model;
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.destroy();
    model.unset('message', {silent: true});
  }

});

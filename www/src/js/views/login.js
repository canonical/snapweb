var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/login.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({
  className: '',

  template: function(model) {
    return template(model);
  },

  ui: {
    statusmessage: '.statusmessage',
  },

  events: {
    'click #login': 'handleSubmit',
  },
  modelEvents: {
    'invalid': function(model, error) {
      this.setErrorStatus(error);
    },
  },

  setErrorStatus: function(msg) {
    this.ui.statusmessage.text(msg);
    this.ui.statusmessage.removeClass('has-warning');
    this.ui.statusmessage.addClass('has-error');
    this.ui.statusmessage.show();
  },

  handleSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();

    this.model.save({
        email: $('input[type="email"]').val(),
        password: $('input[type="password"]').val(),
        otp: $('input[type="number"]').val(),
      }, {
      success: function() {
        // redirect to home for now
        window.location = '/';
      },
      error: function(model, response) {
        model.trigger('invalid', model, 'Invalid');
      }
    });
  },
});

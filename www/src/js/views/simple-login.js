// simple-login view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/simple-login.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  ui: {
    statusmessage: '.statusmessage',
    otpfield: '.otpfield',
    btncreate: '.btn-create',
  },

  events: {
    'click #btn-login': 'handleLogin',
  },

  modelEvents: {
    'invalid': function(model, error) {
      this.setErrorStatus(error);
    },
    'two-factor-required': function(msg) {
      this.setWarningStatus(msg);
      this.ui.otpfield.show();
    },
    'two-factor-failed': function(msg) {
      this.setWarningStatus(msg);
    },
    'login-required': function(msg) {
      this.setErrorStatus(msg);
    },
    'invalid-auth-data': function(msg) {
      this.setErrorStatus(msg);
    },
    'success': function() {
      this.setStatus('OK');
      // TODO: wait, then redirect
    },
  },

  clearStatus: function() {
    this.ui.statusmessage.hide();
  },
  setStatus: function(msg) {
    this.ui.statusmessage.text(msg);
    this.ui.statusmessage.removeClass('has-warning');
    this.ui.statusmessage.removeClass('has-error');
    this.ui.statusmessage.show();
  },
  setWarningStatus: function(msg) {
    this.ui.statusmessage.text(msg);
    this.ui.statusmessage.addClass('has-warning');
    this.ui.statusmessage.removeClass('has-error');
    this.ui.statusmessage.show();
  },
  setErrorStatus: function(msg) {
    this.ui.statusmessage.text(msg);
    this.ui.statusmessage.removeClass('has-warning');
    this.ui.statusmessage.addClass('has-error');
    this.ui.statusmessage.show();
  },

  handleLogin: function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.model.set({
      email: this.$('#emailSSO').val(),
      password: this.$('#password').val(),
      otp: this.$('#otp').val(),
    });
    if (this.model.isValid()) {
      this.setStatus('Authentication...'); // via snapd...
      this.model.save({}, {
        success: function(model, response) {
          model.trigger('success');
        },
        error: function(model, response) {
          if (response.status == 401) {
            model.trigger(response.responseJSON.result.kind,
                         response.responseJSON.result.message);
          } else {
            model.trigger('invalid', model, response);
          }
        }
      });
    }
  },

  template : function(model) {
    return template(model);
  },

});

// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var template = require('../templates/first-boot.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  ui: {
    statusmessage: ".statusmessage",
    btncreate: ".btn-create",
  },

  events: {
    'click #btn-create': 'handleCreate',
  },

  modelEvents: {
    'status-update': function(msg) {
      this.ui.statusmessage.html(msg);
      this.ui.statusmessage.removeClass('has-error');
      this.ui.statusmessage.removeClass('has-warning');
      this.ui.statusmessage.show();
    },
    'invalid': function(model, error) {
      this.ui.statusmessage.text(error);
      this.ui.statusmessage.addClass('has-error');
      this.ui.statusmessage.show();
    },
    'success': function(model, response) {
      this.model.set({ ipaddress: location.hostname });
      this.model.set({ username: response.result.username });
      this.$('#firstboot-step-1').hide();
      this.$('#firstboot-step-2').show();
    },
    'change': function() {
      this.render();
    },
  },

  handleCreate: function(event) {
    event.preventDefault();
    this.model.set({
      email: this.$('#emailSSO').val(),
      sudoer: true,
    });
    if (this.model.isValid()) {
      this.model.trigger('status-update', 'Contacting store...'); // via snapd...
      this.model.save({}, {
        success: function(model, response) {
          model.trigger('success', model, response);
        },
        error: function(model, response) {
          var error = eval(response.reponseText);
          model.trigger('invalid', model, response.responseText);
        }
      });
    }
  },

  template : function(model) {
    return template(model);
  },

});

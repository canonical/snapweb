// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var template = require('../templates/first-boot.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  ui: {
    statusmessage: ".statusmessage",
  },

  events: {
    'click #btn-create': 'handleCreate',
  },

  modelEvents: {
    'status-update': function(msg) {
      console.log(msg);
      this.ui.statusmessage.html(msg);
      this.ui.statusmessage.removeClass('has-error');
      this.ui.statusmessage.removeClass('has-warning');
      this.ui.statusmessage.show();
    },
    'invalid': function(model, error) {
      console.log(error);
      this.ui.statusmessage.text(error);
      this.ui.statusmessage.addClass('has-error');
      this.ui.statusmessage.show();
    }, 
 },

  handleCreate: function(event) {
    event.preventDefault();
    console.log('create button pressed');
    // this.$('#btn-create').attr('disabled', 'true');
    this.model.trigger('status-update', 'Contacting store...');
    this.model.save(
      {
        email: this.$('#emailSSO').val(),
        sudoer: true,
      },
      {
        success: function() {
          console.log('success');
        },
        error: function() {
          console.log('error');
        }
      }
    );
  },

  template : function() {
    return template();
  },

});

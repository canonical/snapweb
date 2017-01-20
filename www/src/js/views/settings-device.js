var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/settings-device.hbs');
var Config = require('../config.js');
var chan = Radio.channel('root');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__device',

  events: {
    'click #restart-button': 'restart',
    'click #power-off-button': 'powerOff',
    'click #cancel-button': 'cancelRequest',
    'click #confirm-button': 'confirmRequest'
  },

  template: function(model) {
    return template(model);
  },

  restart: function() {
    this.displayConfirmation("Your device will be restarted immediately", 
                             "Restart",
                             function() { this.sendAction("restart"); });
  },

  powerOff: function() {
    this.displayConfirmation("Choosing to power off will disconnect" +
                              " from snapweb instantly. Do you want to proceed",
                             "Power off",
                             function() { this.sendAction("power-off"); });
  },

  displayConfirmation: function(message, confirmText, success) {
    this.$('div[class=p-confirmation]').css({display: 'block'});
    this.$('div[class=p-confirmation__dialog__message]').html(message);
    this.$('#confirm-button').text(confirmText);
    this.successFunction = success;
  },

  cancelRequest: function() {
    this.$('div[class=p-confirmation]').css({display: 'none'});
    this.successFunction = null;
  },

  confirmRequest: function() {
    if (this.successFunction === null) {
      return;
    }
    this.$('div[class=p-confirmation]').css({display: 'none'});
    this.successFunction();
    this.successFunction = null;
  },

  sendAction: function(actionType) {
    Backbone.ajax({
                url: Config.DEVICE_ACTION,
                contentType: 'application/json',
                type: 'POST',
                data: '{ "actionType":"' + actionType + '"}',
                processData: false,
                async: true,
                error: function(jqXHR, textStatus, errorThrown) {
                  chan.command('alert:error',
                               new Backbone.Model({message: errorThrown}));
                }
              });
  }

});

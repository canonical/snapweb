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
    'click #power-off-button': 'powerOff'
  },

  template: function(model) {
    return template(model);
  },

  restart: function() {
    Backbone.ajax({
                url: Config.DEVICE_ACTION,
                contentType: 'application/json',
                type: 'POST',
                data: '{ "actionType": "restart" }',
                processData: false,
                async: true,
                error: function(jqXHR, textStatus, errorThrown) {
                  chan.command('alert:error',
                               new Backbone.Model({message: errorThrown}));
                }
              });
  },

  powerOff: function() {
    Backbone.ajax({
                url: Config.DEVICE_ACTION,
                contentType: 'application/json',
                type: 'POST',
                data: '{ "actionType": "power-off" }',
                processData: false,
                async: true,
                error: function(jqXHR, textStatus, errorThrown) {
                  chan.command('alert:error',
                               new Backbone.Model({message: errorThrown}));
                }
              });
  }

});

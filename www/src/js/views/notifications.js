var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/notifications.hbs');
var chan = Radio.channel('root');

module.exports = Backbone.Marionette.ItemView.extend({

  events: {
    'click @ui.close': 'onClose'
  },

  ui: {
    'close': '.u-notifications-close'
  },

  template: function(model) {
    if (!model.message) {
      model.message = '' + model.updatesAvailable +
          ' updates ready to install.';
    }
    return template(model);
  },

  onClose: function(e) {
    this.destroy();
    chan.command('notification:closed');
  }

});

// install behavior
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONF = require('../config.js');
var Snap = require('../common/snaps.js');

module.exports = Marionette.Behavior.extend({
  events: {
    'click @ui.enableButton': 'onEnableClick'
  },

  modelEvents: {
    'change:status': 'onStatusChange'
  },

  ui: {
    enableButton: '.b-enable__button'
  },

  onStatusChange: function(model) {
    var oldState = model.previous('status');
    var state = model.get('status');
    var msg = model.get('installActionString');
    var installer = this.ui.installer;
    var installerButton = this.ui.enableButton;

    if (_.contains(CONF.INSTALL_STATE, state)) {
      enableButton.text(msg);
    } else {
      // in the rare case that a status isn't one we're expecting,
      // remove the install button
//       installer.remove();
    }
  },

  onInstallClick: function(event) {
    return Snap.handleEnableEvent(event, this.view.model);
  },
});

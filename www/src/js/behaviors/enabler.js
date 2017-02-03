// enabler behavior
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONF = require('../config.js');
var Snap = require('../common/snaps.js');

module.exports = Marionette.Behavior.extend({
  events: {
    'click @ui.enableButton': 'onEnableClick',
  },

  modelEvents: {
    'change:status': 'onStatusChange',
  },

  ui: {
    enableButton: '.b-enabler__button',
    enabler: '.b-enabler',
  },

  onStatusChange: function(model) {
    var state = model.get('status');
    var msg = model.get('enableDisableActionString');
    var enableButton = this.ui.enableButton;

    if (state === CONF.INSTALL_STATE.ENABLING ||
        state === CONF.INSTALL_STATE.DISABLING ||
        state === CONF.INSTALL_STATE.INSTALLED ||
        state === CONF.INSTALL_STATE.ACTIVE) {
      enableButton.text(msg);
    }
  },

  onEnableClick: function(event) {
    return Snap.handleEnableEvent(event, this.view.model);
  },
});

// install behavior
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONF = require('../config.js');
var Snap = require('../common/snaps.js');

module.exports = Marionette.Behavior.extend({
  events: {
    'click @ui.installerButton': 'onInstallClick'
  },

  modelEvents: {
    'change:installHTMLClass': 'onHTMLClassChange',
    'change:installButtonClass': 'onButtonClassChange',
    'change:status': 'onStatusChange'
  },

  ui: {
    errorMessage: '.b-installer__error',
    installer: '.b-installer',
    installerButton: '.b-installer__button'
  },

  onHTMLClassChange: function(model) {
    var installer = this.ui.installer;
    installer.removeClass(model.previous('installHTMLClass'))
             .addClass(model.get('installHTMLClass'));
  },

  onButtonClassChange: function(model) {
    var button = this.ui.installerButton;
    button.removeClass(model.previous('installButtonClass'))
          .addClass(model.get('installButtonClass'));
  },

  onStatusChange: function(model) {
    var oldState = model.previous('status');
    var state = model.get('status');
    var msg = model.get('installActionString');
    var installer = this.ui.installer;
    var installerButton = this.ui.installerButton;

    if (_.contains(CONF.INSTALL_STATE, state)) {
      installerButton.text(msg);
    } else {
      // in the rare case that a status isn't one we're expecting,
      // remove the install button
      installer.remove();
    }
  },

  onInstallClick: function(event) {
    return Snap.handleInstallEvent(event, this.view.model);
  },
});

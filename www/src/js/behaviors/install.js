// install behavior
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var CONF = require('../config.js');

module.exports = Marionette.Behavior.extend({
  events: {
    'click @ui.installerButton': 'onInstallClick'
  },

  modelEvents: {
    'change:installHTMLClass': 'onHTMLClassChange',
    'change:status': 'onStatusChange',
    'change:progress': 'onProgressChange'
  },

  ui: {
    errorMessage: '.b-installer__error',
    statusMessage: '.b-installer__message',
    installer: '.b-installer',
    installerButton: '.b-installer__button',
    installerProgress: '.b-installer__value'
  },

  onHTMLClassChange: function(model) {
    var installer = this.ui.installer;
    installer.removeClass(model.previous('installHTMLClass'))
    .addClass(model.get('installHTMLClass'));
  },

  onStatusChange: function(model) {
    var oldState = model.previous('status');
    var state = model.get('status');
    var msg = model.get('installActionString');
    var installer = this.ui.installer;
    var installerButton = this.ui.installerButton;

    // reset progress
    this.ui.installerProgress.css('right', '100%');

    if (_.contains(CONF.INSTALL_STATE, state)) {
      installerButton.text(msg);
    } else {
      // in the rare case that a status isn't one we're expecting,
      // remove the install button
      installer.remove();
    }

    if (
      state === CONF.INSTALL_STATE.INSTALLED &&
      oldState === CONF.INSTALL_STATE.INSTALLING
    ) {
      this.ui.statusMessage.text('Install successful!');
    } else {
      this.ui.statusMessage.text('');
    }

    if (
      state === CONF.INSTALL_STATE.REMOVED &&
      oldState === CONF.INSTALL_STATE.REMOVING
    ) {
      this.ui.statusMessage.text('Snap removed!');
    }
  },

  onProgressChange: function(model) {
    var state = model.get('status');
    var progress;

    if (state === CONF.INSTALL_STATE.INSTALLING) {
      progress = (100 - (model.get('progress') | 0)) + '%';
      this.ui.installerProgress.css('right', progress);
    }
  },

  onInstallClick: function(e) {
    var model = this.view.model;
    var status = model.get('status');
    var isInstallable = model.get('isInstallable');

    if (!isInstallable) {
      return;
    }

    if (status === CONF.INSTALL_STATE.INSTALLED) {
      // remove
      model.set({
        status: CONF.INSTALL_STATE.REMOVING
      });
      model.destroy({
        dataType : 'json',
        silent: true
      });
    } else if (status === CONF.INSTALL_STATE.REMOVED) {
      // install
      model.save({
        status: CONF.INSTALL_STATE.INSTALLING
      }, {
        dataType : 'json'
      });
    } else {
      e.preventDefault();
    }
  }
});

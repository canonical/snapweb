// snap.js

var _ = require('lodash');
var Backbone = require('backbone');
var CONF = require('../config.js');

/** Snap Model
 *
 * var helloWorld = new Snap({id: 'hello-world'});
 *
 * // fetch from server (http GET)
 * helloWorld.fetch({
 *   success: function(snap) {
 *     console.log(snap);
 *   }
 * });
 *
 * // install (http PUT)
 * // uninstall (http DELETE)
 * // upgrade (http UPGRADE)
 *
 **/

module.exports = Backbone.Model.extend({

  urlRoot: CONF.PACKAGES,

  idAttribute: 'name',

  initialize: function() {

    this.on('error', function(model, response, opts) {
      var httpStatus = opts.xhr.status;
    });

    this.on('add sync', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;

      if (status === 202 ||
          status === CONF.INSTALL_STATE.INSTALLING ||
          status === CONF.INSTALL_STATE.UNINSTALLING) {
        _.delay(function(model) {
          model.fetch();
        }, CONF.INSTALL_POLL_WAIT, model);
      }

    });

    this.on('error', function(model, response, opts) {
      var status = model.get('status') || opts.xhr.status;
      model.set({
        'status': model.previous('status'),
        'isError': true,
        'message': response.statusText
      });
    });

    this.on('add change:status', this.handleStatusChange);
  },

  handleStatusChange: function(model) {
    this.setInstallActionString(model);
    this.setInstallHTMLClass(model);
  },

  setInstallHTMLClass: function(model) {
    var state = model.get('status');
    var installHTMLClass = '';

    if (state === CONF.INSTALL_STATE.INSTALLING) {
      installHTMLClass = 'thinking link-cta-positive';
    }

    if (state === CONF.INSTALL_STATE.UNINSTALLING) {
      installHTMLClass = 'thinking link-cta-negative';
    }

    if (state === CONF.INSTALL_STATE.INSTALLED) {
      installHTMLClass = 'link-cta-negative';
    }

    if (state === CONF.INSTALL_STATE.UNINSTALLED) {
      installHTMLClass = 'link-cta-positive';
    }

    return model.set('installHTMLClass', installHTMLClass);

  },

  setInstallActionString: function(model) {
    var state = model.get('status');
    var action;

    switch (state) {
      case CONF.INSTALL_STATE.INSTALLED:
        action = 'Uninstall';
        break;
      case CONF.INSTALL_STATE.INSTALLING:
        action = 'Installing…';
        break;
      case CONF.INSTALL_STATE.UNINSTALLED:
        action = 'Install';
        break;
      case CONF.INSTALL_STATE.UNINSTALLING:
        action = 'Uninstalling…';
        break;
      default:
        // XXX
        // has the effect of hiding the install button in the view,
        // as we have an indeterminate state
        return model.unset('installActionString');
    }

    return model.set('installActionString', action);
  },

  parse: function(response) {
    if (response.hasOwnProperty('icon') && !response.icon.length) {
      response.icon = this.defaults.icon;
    }
    return response;
  },

  defaults: {
    icon: '/public/images/default-package-icon.svg',
    installActionString: false
  }

});

// router.js

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}

var controller = require('../controllers/controller.js');

module.exports = Marionette.AppRouter.extend({
  controller: controller,
  appRoutes: {
    '': 'home',
    'store': 'store',
    'apps/:name': 'app',
    'apps/:name/:section': 'appSection',
    'system-settings': 'settings'
  },
});

// app.js

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var RootView = require('./views/root.js');
var homeController = require('./controllers/home.js');
var storeController = require('./controllers/store.js');
var systemController = require('./controllers/system.js');

var webdm = new Marionette.Application();
var rootView = new RootView();
rootView.render();

// set up some routes with controllers... 
webdm.routers = {};

webdm.routers.home = new Marionette.AppRouter({
  controller: homeController,
  appRoutes: {
    '': 'index'
  }
});

webdm.routers.store = new Marionette.AppRouter({
  controller: storeController,
  appRoutes: {
    'store': 'index'
  }
});

webdm.routers.system = new Marionette.AppRouter({
  controller: systemController,
  appRoutes: {
    'system-settings': 'index'
  }
});

/**
webdm.routers.snap = new Marionette.AppRouter({
  controller: snapController,
  appRoutes: {
    'apps': 'index',
    'apps/:name': 'snap',
    'apps/:name/:section': 'section',
  }
});
**/

webdm.on('start', function() {
  Backbone.history.start({pushState: true});
});

$(document).ready(function() {
  webdm.start();
});

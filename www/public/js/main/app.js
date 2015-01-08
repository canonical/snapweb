YUI.add('demo', function(Y) {
  'use strict';

  var iot = Y.namespace('iot');

  var showHome = function(req, res, next) {
    this.showView('home');
  };

  var showStore = function(req, res, next) {
    iot.core.store.show();
  };

  var showApp = function(req, res, next) {
    var name = req.params.name;
    console.log(name);
  };

  var showAppReviews = function(req, res, next) {
    var name = req.params.name;
    console.log(name);
  };

  var showAppSettings = function(req, res, next) {
    var name = req.params.name;
    console.log(name);
  };

  var showSettings = function(req, res, next) {
    iot.core.settings.show();
  };

  var app = Y.namespace('iot').app = new Y.App({
    viewContainer: '.layout-app-container',
    serverRouting: true,
    transitions: false,
    views: {
      home: {
        preserve: true,
        type: 'iot.views.home'
      },
      store: {
        preserve: false,
        type: 'iot.views.store'
      },
      settings: {
        preserve: false,
        type: 'iot.views.settings'
      }
    },
    routes: [
      {path: '/', callbacks: showHome},
      {path: '/store', callbacks: showStore},
      {path: '/store/:name', callbacks: showApp},
      {path: '/store/:name/reviews', callbacks: showAppReviews},
      {path: '/store/:name/settings', callbacks: showAppSettings},
      {path: '/system-settings', callbacks: showSettings}
    ]
  });

  app.render().dispatch();

}, '0.0.1', {
  requires: [
    'node',
    'app',
    'template',
    'iot-views-home',
    'iot-store',
    'iot-settings'
  ]
});

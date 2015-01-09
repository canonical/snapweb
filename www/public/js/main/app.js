YUI.add('demo', function(Y) {
  'use strict';

  var iot = Y.namespace('iot');

  var showHome = function(req, res, next) {
    this.showView('home');
  };

  var showStore = function(req, res, next) {
    iot.core.store.show();
  };

  var showSettings = function(req, res, next) {
    iot.core.settings.show();
  };

  var showSearch = function(req, res, next) {
    iot.core.search.show();
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
      },
      search: {
        preserve: true,
        type: 'iot.views.search'
      }
    },
    routes: [
      {path: '/', callbacks: showHome},
      {path: '/store', callbacks: showStore},
      {path: '/system-settings', callbacks: showSettings},
      {path: '/q', callbacks: showSearch}
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
    'iot-settings',
    'iot-search'
  ]
});

YUI.add('demo', function(Y) {
  'use strict';

  var iot = Y.namespace('iot');

  var showHome = function(req, res, next) {
    this.showView('home');
  };

  var showStore = function(req, res, next) {
    console.log('showStore');
    iot.core.store.show();
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
      }
    },
    routes: [
      {path: '/', callbacks: showHome},
      {path: '/store', callbacks: showStore},
    ]
  });

  app.render().dispatch();

}, '0.0.1', {
  requires: [
    'node',
    'app',
    'template',
    'iot-views-home',
    'iot-store'
  ]
});

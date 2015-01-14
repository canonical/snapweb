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
    var snap = new Y.iot.models.Snap({id: name});

    snap.load(function() {
      Y.iot.app.showView('snap', {
        model: snap
      });
    });
  };

  var showAppDetails = function(req, res, next) {
    var name = req.params.name;
    var snap = new Y.iot.models.Snap({id: name});

    snap.load(function() {
      Y.iot.app.showView('snap', {
        model: snap
      }, function(view) {
        //view.get('container').one('.snap-nav-detail').scrollIntoView(true);
      });
    });
  };

  var showAppReviews = function(req, res, next) {
    var name = req.params.name;
    var snap = new Y.iot.models.Snap({id: name});

    snap.load(function() {
      Y.iot.app.showView('snap', {
        model: snap,
        // get as model, wrap loads in promise, promise all -> showView
        reviews: true
      }, function(view) {
        //view.get('container').one('.snap-nav-detail').scrollIntoView(true);
      });
    });
  };

  var showAppSettings = function(req, res, next) {
    var name = req.params.name;
    var snap = new Y.iot.models.Snap({id: name});

    snap.load(function() {
      Y.iot.app.showView('snap', {
        model: snap,
        // get as model, wrap loads in promise, promise all -> showView
        settings: true
      }, function(view) {
        //view.get('container').one('.snap-nav-detail').scrollIntoView(true);
      });
    });
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
        type: 'iot.views.store.Index'
      },
      snap: {
        preserve: false,
        type: 'iot.views.snap.snap'
      },
      settings: {
        preserve: false,
        type: 'iot.views.settings'
      }
    },
    routes: [
      {path: '/', callbacks: showHome},
      {path: '/store', callbacks: showStore},
      {path: '/apps/:name', callbacks: showApp},
      {path: '/apps/:name/details', callbacks: showAppDetails},
      {path: '/apps/:name/reviews', callbacks: showAppReviews},
      {path: '/apps/:name/settings', callbacks: showAppSettings},
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
    'iot-views-snap',
    'iot-store',
    'iot-settings',
    'iot-models-snap'
  ]
});

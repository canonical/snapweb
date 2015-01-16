YUI.add('demo', function(Y) {
  'use strict';

  var iot = Y.namespace('iot');

  var showOverlay = function(hide) {
    var overlay = app.get('overlay');
    if (hide) {
      overlay.replaceClass('app-overlay--show', 'app-overlay--hide');
    } else {
      overlay.replaceClass('app-overlay--hide', 'app-overlay--show');
    }
  };

  var showHome = function(req, res, next) {
    var installed = new Y.iot.models.InstalledList();

    installed.load(function() {
      Y.iot.app.showView('home', {
        modelList: installed
      });
    });
  };

  var search = function(req, res, next) {
    var query = req.query.q || '';
    var list = new Y.iot.models.SnapList({
      url: YUI.Env.iot.api.search + '?q=' + query
    });

    list.load(function() {
      showOverlay();
      Y.iot.app.showView('search', {
        modelList: list,
        queryString: query
      });
    });
  };

  var hideSearch = function(req, res, next) {
    var view = app.get('searchView');
    showOverlay(true);
    if (view) {
      view.destroy();
    }
    next();
  };

  var showStore = function(req, res, next) {
    var list = new Y.iot.models.SnapList();

    list.load(function() {
      Y.iot.app.showView('store', {
        modelList: list
      });
    });
  };

  var getLocalSnapPromise = function(name) {
    name = name.replace('com.ubuntu.snappy.', '');
    return new Y.Promise(function(resolve, reject) {
      Y.io(YUI.Env.iot.api.packages + name, {
        on: {
          success: function(id, response) {
            resolve(JSON.parse(response.responseText));
          },
          failure: function() {
            resolve(false);
          }
        }
      });
    });
  };

  var getStoreSnapPromise = function(name) {
    return new Y.Promise(function(resolve, reject) {
      var snap = new Y.iot.models.Snap({id: name});
      snap.load(function() {
        resolve(snap);
      });
    });
  };

  var showApp = function(req, res, next) {
    var name = req.params.name;
    var section = req.params.section;

    Y.Promise.all([
      getStoreSnapPromise(name),
      getLocalSnapPromise(name)
    ]).then(function(data) {

      data[0].set('installed', !!data[1]);

      var view = new Y.iot.views.snap.snap({
        model: data[0],
        section: section
      });

      Y.iot.app.showView(view, null, {
        render: true
      });
    });
  };

  var hideSearch = function(req, res, next) {
    Y.one('.search-results').setHTML();
    next();
  };

  var showSettings = function(req, res, next) {
    var installed = new Y.iot.models.InstalledList();

    var getSnaps = new Y.Promise(function(resolve) {
      installed.load(function() {
        resolve(installed);
      });
    });

    var getSettings = new Y.Promise(function(resolve, reject) {
      Y.io(YUI.Env.iot.api.settings, {
        on: {
          success: function(id, response) {
            resolve(JSON.parse(response.responseText));
          },
          failure: function() {
            reject(new Error('getSettings request failed: ' + response));
          }
        }
      });
    });

    Y.Promise.all([
      getSnaps,
      getSettings
    ]).then(function(data) {

      var view = new Y.iot.views.settings({
        modelList: data[0],
        settings: data[1]
      });

      Y.iot.app.showView(view, null, {
        render: true
      });
    });
  };

  var app = Y.namespace('iot').app = new Y.App({
    viewContainer: '.layout-app-container',
    serverRouting: true,
    transitions: false,
    views: {
      home: {
        preserve: false,
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
      search: {
        preserve: false,
        type: 'iot.views.search'
      },
      settings: {
        preserve: false,
        type: 'iot.views.settings'
      }
    },

    routes: [
      {path: '/', callbacks: [hideSearch, showHome]},
      {path: '/store', callbacks: [hideSearch, showStore]},
      {path: '/search', callbacks: [search]},
      {path: '/apps/:name', callbacks: [hideSearch, showApp]},
      {path: '/apps/:name/:section', callbacks: [hideSearch, showApp]},
      {path: '/system-settings', callbacks: [hideSearch, showSettings]}
    ],

    events: {
      '.search-form button': {
        'click': function(e) {
          e.preventDefault();

          var query = e.target.ancestor().one('input').get('value');
          var list = new Y.iot.models.SnapList({
            url: YUI.Env.iot.api.search + '?q=' + query
          });

          list.load(function() {
            showOverlay();
            var view = Y.iot.app.createView('search', {
              modelList: list,
              queryString: query
            }).render();

            app.set('searchView', view);
          });
        }
      }
    }
  });

  app.set('overlay', Y.one('.app-overlay'));

  app.render().dispatch();

}, '0.0.1', {
  requires: [
    'node',
    'app',
    'promise',
    'template',
    'iot-config',
    'iot-views-home',
    'iot-views-snap',
    'iot-views-store',
    'iot-views-search',
    'iot-views-settings',
    'iot-store',
    'iot-models-snap',
    'iot-models-snap-list',
    'iot-models-installed',
    'iot-models-installed-list'
  ]
});

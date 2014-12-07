YUI.add('demo', function(Y) {
  'use strict';

  var ns = Y.one('.layout-nav-primary');
  var mu = new Y.Template();

  var stringToFunction = function(string, context /*, args */ ) {
    var args = [].slice.call(arguments, 2);
    string.split('.').forEach(function(prop) {
      context = context[prop];
    });
    context.apply(context, args);
  };

  // lazy loading of modules
  // load and execute views related to icons on click
  Y.one('body').delegate('click', function(e) {
    var module = this.getData('module');
    var fn = this.getData('fn');
    var api = this.getData('api');
    Y.use(module, function() {
      if (fn && typeof(fn) === 'string') {
        stringToFunction(fn, Y, api);
      }
    });
  }, '.icon');

  var app = Y.namespace('DEMO').app = new Y.App({
    viewContainer: '.layout-app-container',
    serverRouting: true,
    views: {
      home: {
        preserve: true,
        type: 'DEMO.VIEW.Home'
      }
    }
  });

  app.on('installedChange', function(e) {
    var data = e.newVal;
    var template = mu.revive(Y.DEMO.MAIN.TMPL.ICONS.template);
    var html = template({
      icons: data
    });
    ns.setHTML(html);

  });

  var onInstalledList = function(id, res) {
    app.set('installed', JSON.parse(res.response));
  };

  var xhrInstalled = function(req, res, next) {
    Y.io('/mock-api/installed.json', {
      on: {
        success: onInstalledList,
        failure: function(id, res) {
          console.log('fail');
          console.log(res);
        }
      }
    });
    next();
  };

  // routes
  app.route('*', xhrInstalled);
  app.route('/', function() {
    this.showView('home');
  });

  app.route('*', function() {
    window.alert('404');
  });
  app.render().dispatch();

}, '0.0.1', {
  requires: [
    'node',
    'app',
    'template',
    'node-event-delegate',
    'demo-view-home',
    't-main-tmpl-icons'
  ]
});

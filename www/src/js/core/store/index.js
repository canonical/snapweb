YUI.add('core-store', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var navData = [{
    name: 'All'
  }, {
    name: 'Installed'
  }];

  var onSuccess = function(id, res) {
    var snaps = JSON.parse(res.responseText);
    snaps = snaps._embedded['clickindex:package'];

    var view = new Y.DEMO.CORE.STORE.View({
      list: snaps,
      nav: navData
    });
    app.showView(view, null, {
      render: true,
      callback: checkInstalled

    });
  };

  var checkInstalled = function(view) {
    Y.io('/api/v1/packages/', {
      on: {
        success: function(id, res, name) {
          var installed = JSON.parse(res.responseText);
          var view = Y.DEMO.app.get('activeView');
          var apps = view.get('list');
          var btns;
          if (view.name === name) {

            Y.Array.each(installed, function(item) {
              var match = Y.Array.find(apps, function(app) {
                return (item.name === app.name);
              });

              if (match) {
                var selector = '[data-pkg="' + match.name + '"]';
                view.get('container').one(selector).
                replaceClass('uninstalled', 'installed');
              }
            });

            view.get('container').addClass('checked');

          } else {
            console.log('no');
          }
        },
        failure: function(id, res) {
        }
      },
      'arguments': view.name
    });
  };

  var show = function() {
    Y.io('/mock-api/store.json', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSettings fail');
        }
      }
    });
  };

  Y.namespace('DEMO.CORE.STORE').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'core-store-views'
  ]
});

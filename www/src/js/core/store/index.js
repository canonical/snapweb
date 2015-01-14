YUI.add('iot-store', function(Y) {
  'use strict';

  var app = Y.iot.app;

  var onSuccess = function(id, res) {
    var snaps = JSON.parse(res.responseText);
    snaps = snaps._embedded['clickindex:package'];

    var view = new Y.iot.views.store.Index({
      list: snaps
    });

    Y.iot.app.showView(view, null, {
      render: true,
      callback: checkInstalled
    });

  };

  var checkInstalled = function(view) {
    Y.io('/api/v1/packages/', {
      on: {
        success: function(id, res, name) {
          var installed = JSON.parse(res.responseText);
          var view = Y.iot.app.get('activeView');
          var available = view.get('list');

          if (view.name === name) {

            Y.Array.each(available, function(apkg) {
              Y.Array.every(installed, function(ipkg) {

                var sel = '[data-pkg="' + apkg.name + '"]';
                var container = view.get('container');
                var stateUI = container.one(sel + ' .switch');

                var label = stateUI.one('label');
                var input = stateUI.one('input');

                var btn = container.one(sel + ' .pkg-show');

                stateUI.removeClass('thinking');

                if (apkg.name === ipkg.name) {
                  label.set('text', 'Package installed');
                  label.setAttribute('data-tt', 'Click to remove package');
                  input.setAttrs({
                    checked: true,
                    disabled: false
                  });

                  // XXX port property broken, fake it
                  if (ipkg.port || ipkg.name === 'xkcd-webserver') {
                    var port = ipkg.port || 80;
                    btn.setAttribute('href', [YUI.Env.iot.url, port].join(':'))
                      .removeClass('hide');
                  }
                  return false;
                } else {
                  label.set('text', 'Install package');
                  label.setAttribute('data-tt', 'Click to install');
                  input.setAttrs({
                    checked: false,
                    disabled: false
                  });
                  return true;
                }
              });

            });

            view.get('container').addClass('checked');

          } else {
            console.log('no');
          }
        },
        failure: function(id, res) {
          window.alert('GET /api/v1/packages FAIL. Check console.');
          console.log(res);
        }
      },
      'arguments': view.name
    });
  };

  var show = function() {

    var list = new Y.iot.models.SnapList();

    list.load(function() {
      Y.iot.app.showView('store', {
        modelList: list
      }, {
        callback: checkInstalled
      });
    });

    /**
    Y.io('/api/v1/store/', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSettings fail');
        }
      }
    });
    **/
  };

  Y.namespace('iot.core.store').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'iot-views-store',
    'iot-models-snap-list'
  ]
});

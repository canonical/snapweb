YUI.add('core-manage', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var onSuccess = function(id, res) {

    var snaps = JSON.parse(res.responseText);
    // XXX filter out snappyd
    snaps = Y.Array.filter(snaps, function(item, i) {
      if (item.name !== 'snappyd') {
        return true;
      }
    });

    var showMe = snaps[0];

    // XXX fake xkcd port
    if (showMe && showMe.name === 'xkcd-webserver' && !showMe.ports) {
      showMe.ports = {
        required: '80'
      };
      showMe.url = [YUI.Env.demoUrl, showMe.ports.required].join(':');
    }

    if (snaps && snaps.length) {
      var view = new Y.DEMO.CORE.MANAGE.View({
        snapList: snaps,
        snap: showMe
      });
      app.showView(view, null, {render: true});
    } else {
      window.alert('Nothing installed running, visit the store!');
    }
  };

  var show = function() {
    Y.io('/api/v1/packages', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSettings fail');
        }
      }
    });
  };

  Y.namespace('DEMO.CORE.MANAGE').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'core-manage-views'
  ]
});

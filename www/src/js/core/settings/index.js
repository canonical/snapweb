YUI.add('iot-settings', function(Y) {
  'use strict';

  var app = Y.iot.app;

  var onSuccess = function(id, res) {
    var about = JSON.parse(res.responseText);
    var view = new Y.iot.views.settings.Index({
      list: about
    });

    Y.iot.app.showView(view, null, {
      render: true
    });

  };

  var show = function() {
    Y.io('/api/v1/systemimage/', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSettings fail');
        }
      }
    });
  };

  Y.namespace('iot.core.settings').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'iot-views-settings'
  ]
});

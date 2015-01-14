YUI.add('iot-settings', function(Y) {
  'use strict';

  var app = Y.iot.app;

  var onSuccess = function(id, res) {
    var about = JSON.parse(res.responseText);
    var appData = [];
    for (var index = 0; index < mockAppData.length; index++) {
      var app = mockAppData[index];

      // Don't add snappyd
      if (app.name != 'snappyd') {
        appData.push(app);
      }
    }

    var view = new Y.iot.views.settings.Index({
      list: {
        system: about,
        apps: appData
      }
    });

    Y.iot.app.showView(view, null, {
      render: true
    });

  };

  var show = function() {
    Y.io(YUI.Env.iot.api.settings, {
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

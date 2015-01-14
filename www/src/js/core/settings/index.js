mockAppData = [
    {
        "description": "\n",
        "maintainer": "Clapping Team",
        "name": "snappyd",
        "version": "0.3",
        "services": [
            {
                "name": "snappyd",
                "status": "active"
            }
        ],
        "ports": {
            "required": 8080
        }
    },
    {
        "description": "An example package",
        "maintainer": "Someone <someone@example.com",
        "name": "example",
        "version": "0.3",
        "services": [
            {
                "name": "example",
                "status": "active"
            }
        ],
        "ports": {
            "required": 8080
        }
    },
    {
        "description": "This is meant as a fun example for a snappy package.\n",
        "maintainer": "Michael Vogt <michael.vogt@ubuntu.com>",
        "name": "xkcd-webserver",
        "version": "0.3.1",
        "services": [
            {
                "name": "xkcd-webserver",
                "status": "active"
            }
        ]
    }
]

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

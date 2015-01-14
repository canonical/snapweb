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
        "description": "An Calculator application package",
        "maintainer": "Someone <someone@example.com",
        "name": "Calculator application",
        "version": "0.3",
        "iconUrl": "https://developer.staging.ubuntu.com/site_media/appmedia/2014/02/calc.png",
        "services": [
            {
                "name": "Calculator application",
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
        "name": "delta",
        "version": "0.3.1",
        "iconUrl": "https://developer.staging.ubuntu.com/site_media/appmedia/2014/05/delta-web.png",
        "services": [
            {
                "name": "Delta",
                "status": "active"
            }
        ]
    },
    {
        "description": "An TripAdvisor package",
        "maintainer": "Someone <someone@example.com",
        "name": "TripAdvisor",
        "version": "0.3",
        "iconUrl": "https://developer.staging.ubuntu.com/site_media/appmedia/2014/05/tripadvisor_1.png",
        "services": [
            {
                "name": "TripAdvisor",
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
        "name": "CSR Racing",
        "version": "0.3.1",
        "iconUrl": "https://developer.staging.ubuntu.com/site_media/appmedia/2014/05/racing.png",
        "services": [
            {
                "name": "CSR Racing",
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

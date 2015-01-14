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

YUI.add('iot-views-home', function(Y) {
  'use strict';

  var views = Y.namespace('iot.views');
  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  views.home = Y.Base.create('home', Y.View, [], {

    render: function() {
      var template = mu.revive(tmpls.home.compiled);

      var appData = [];
      for (var index = 0; index < mockAppData.length; index++) {
        var app = mockAppData[index];

        // Fake xkcd port
        if (app.name == 'xkcd-webserver') {
          app.url = location.protocol + '//' + location.hostname + ':8090';
        }

        // Don't add snappyd
        if (app.name != 'snappyd') {
          appData.push(app);
        }
      }
      var html = template({'apps': appData});
      this.get('container').setHTML(html);

      return this;
    }
  });
}, '0.0.1', {
  requires: [
    'template',
    't-tmpls-home'
  ]
});

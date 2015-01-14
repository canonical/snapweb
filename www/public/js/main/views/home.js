

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

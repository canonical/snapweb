YUI.add('iot-search', function(Y) {
  'use strict';

  var app = Y.iot.app;

  var onSuccess = function(id, res) {
    var snaps = JSON.parse(res.responseText);
    snaps = snaps._embedded['clickindex:package'];

    var view = new Y.iot.views.search.Index({
      list: snaps
    });

    Y.iot.app.showView(view, null, {
      render: true
    });

  };

  var show = function() {
    Y.io('/mock-api/store.json', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSearch fail');
        }
      }
    });
  };

  Y.namespace('iot.core.search').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'iot-views-search'
  ]
});

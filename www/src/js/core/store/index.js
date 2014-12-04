YUI.add('core-store', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var navData = [{
    name: 'All'
  }, {
    name: 'Installed'
  }];

  var onSuccess = function(id, res) {
    console.log('success');
    console.log(res.responseText);

    var snaps = JSON.parse(res.responseText);
    snaps = snaps._embedded['clickindex:package'];

    var view = new Y.DEMO.CORE.STORE.View({
      list: snaps,
      nav: navData
    });
    app.showView(view, null, {render: true});
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

YUI.add('core-settings', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var navData = [{
    name: 'About'
  }];

  var onSuccess = function(id, res) {
    var about = JSON.parse(res.responseText);
    var view = new Y.DEMO.CORE.SETTINGS.VIEWS.Settings({
      list: about,
      nav: navData
    });

    app.showView(view, null, {
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

  Y.namespace('DEMO.CORE.SETTINGS').show = show;

}, '0.0.1', {
  requires: [
    'io',
    'core-settings-views'
  ]
});

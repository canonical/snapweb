YUI.add('core-manage', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var onSuccess = function(id, res) {
    console.log('success');
    console.log(res.responseText);

    var snaps = JSON.parse(res.responseText);
    var view = new Y.DEMO.CORE.MANAGE.View({
      snapList: snaps,
      snap: snaps[0]
    });
    app.showView(view, null, {render: true});
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

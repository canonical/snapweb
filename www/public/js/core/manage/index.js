YUI.add('core-manage', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var onSuccess = function(id, res) {

    var snaps = JSON.parse(res.responseText);
    /**
    // XXX filter out snappyd
    snaps = Y.Array.filter(snaps, function(item, i) {
      if (item.name !== 'snappyd') {
        return true;
      }
    });
    **/

    if (snaps && snaps.length) {
      var view = new Y.DEMO.CORE.MANAGE.View({
        snapList: snaps,
        snap: snaps[0]
      });
      app.showView(view, null, {render: true});
    } else {
      window.alert('No running services');
    }
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

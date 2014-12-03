YUI.add('core-manage', function(Y) {
  'use strict';

  var app = Y.DEMO.app;

  var onSuccess = function(id, res) {
    console.log('success');
    console.log(res);
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

YUI.add('iot-models-snap', function(Y) {

  Y.io.header('X-Requested-With');
  var Snap = Y.Base.create('snap', Y.Model, [Y.ModelSync.REST], {
    root: 'https://search.apps.staging.ubuntu.com/api/v1/package'
  });

  Y.namespace('iot.models').Snap = Snap;

}, '0.0.1', {
  requires: [
    'model',
    'model-sync-rest'
  ]
});

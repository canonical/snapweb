YUI.add('iot-models-installed', function(Y) {

  Y.io.header('X-Requested-With');

  var Installed = Y.Base.create('installed', Y.Model, [Y.ModelSync.REST], {
    root: YUI.Env.iot.api.packages
  });

  Y.namespace('iot.models').installed = Installed;

}, '0.0.1', {
  requires: [
    'model',
    'model-sync-rest'
  ]
});

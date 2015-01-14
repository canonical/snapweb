YUI.add('iot-models-snap-list', function(Y) {

  Y.io.header('X-Requested-With');
  var SnapList = Y.Base.create('snaps', Y.LazyModelList, [Y.ModelSync.REST], {
    // By convention `Y.User`'s `root` will be used for the lists' URL.
    model: Y.iot.models.Snap,
    url: YUI.Env.iot.api.search,
    parseIOResponse: function(res) {
      var data = JSON.parse(res.responseText);

      if (
        data &&
        data._embedded &&
        data._embedded['clickindex:package'] &&
        data._embedded['clickindex:package'].length
      ) {
        return data._embedded['clickindex:package'];
      }
    }
  });

  Y.namespace('iot.models').SnapList = SnapList;

}, '0.0.1', {
  requires: [
    'lazy-model-list',
    'model-sync-rest',
    'iot-models-snap'
  ]
});

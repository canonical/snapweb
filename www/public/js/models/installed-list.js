YUI.add('iot-models-installed-list', function(Y) {

  Y.io.header('X-Requested-With');
  var InstalledList = Y.Base.create('installedList',
    Y.LazyModelList, [Y.ModelSync.REST], {
    model: Y.iot.models.installed,
    url: YUI.Env.iot.api.packages,
    parseIOResponse: function(res) {
      var data = JSON.parse(res.responseText);

      if (data && data.length) {
        return data;
      }
    }
  });

  Y.namespace('iot.models').InstalledList = InstalledList;

}, '0.0.1', {
  requires: [
    'lazy-model-list',
    'model-sync-rest',
    'iot-models-installed',
  ]
});

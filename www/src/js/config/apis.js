YUI.add('iot-config', function(Y) {
  'use strict';

  var root = 'https://search.apps.staging.ubuntu.com/api/v1/';
  YUI.Env.iot = {};
  YUI.Env.iot.root = root;
  YUI.Env.iot.search = root + 'search';
  YUI.Env.iot.package = root + 'package/';

});

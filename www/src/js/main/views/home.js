YUI.add('iot-views-home', function(Y) {
  'use strict';

  var views = Y.namespace('iot.views');
  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  views.home = Y.Base.create('home', Y.View, [], {

    render: function() {
      var template = mu.revive(tmpls.home.compiled);
      var html = template();
      this.get('container').setHTML(html);

      return this;
    }
  });
}, '0.0.1', {
  requires: [
    'template',
    't-tmpls-home'
  ]
});

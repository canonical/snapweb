YUI.add('iot-views-home', function(Y) {
  'use strict';

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var HomeView = Y.Base.create('home', Y.View, [], {

    template: mu.revive(tmpls.home.compiled),

    render: function() {
      var list = this.get('modelList');
      var listData = list.filter(function(snap) {
        var name = '';

        if (snap.name === 'webdm' || snap.name === 'snappyd') {
          return false;
        }

        //XXX hacks all the way down
        snap.launchable = false;

        if (snap.ports.required !== undefined) {
          snap.launchable = true;
          snap.url = location.protocol + '//' +
            location.hostname + ':' +
            snap.ports.required;
        } else {
          if (snap.name.indexOf('.') === -1) {
            name = 'com.ubuntu.snappy.' + snap.name;
          } else {
            name = snap.name;
          }
          snap.name = name;
          snap.url = '/apps/' + name;
        }
        return snap;
      });

      var content = this.template(listData);

      Y.all('.nav-primary a.active').removeClass('active');

      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views').home = HomeView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-home'
  ]
});

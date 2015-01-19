YUI.add('iot-views-home', function(Y) {
  'use strict';

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var HomeView = Y.Base.create('home', Y.View, [], {

    template: mu.revive(tmpls.home.compiled),

    render: function() {
      var list = this.get('modelList');
      var listData = list.filter(function(snap) {
        if (snap.type === 'framework' || snap.type === 'oem') {
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
          var longName = 'com.ubuntu.snappy.' + snap.name;
          snap.url = '/apps/' + longName;
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

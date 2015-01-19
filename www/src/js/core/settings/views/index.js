YUI.add('iot-views-settings', function(Y) {
  'use strict';

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();
  var SettingsView = Y.Base.create('settingsView', Y.View, [], {

    template: mu.revive(tmpls.settings.list.compiled),

    render: function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;

      var modelList = this.get('modelList');
      var snaps = modelList.filter(function(snap) {
        var name;
        if (snap.type === 'framework' || snap.type === 'oem') {
          return false;
        }

        snap.imgSrc = '/icons/';
        if (snap.name.indexOf('.') === -1) {
          snap.imgSrc += 'com.ubuntu.snappy.';
        }
        snap.imgSrc += snap.name + '.png';
        snap.url = '/apps/' + snap.name;

        return snap;
      });

      var settings = this.get('settings');

      var content = this.template({
        apps: snaps,
        system: settings
      });
      this.get('container').setHTML(content);

      Y.all('.nav-primary a.active').removeClass('active');
      Y.one('.nav-primary a.settings-link').addClass('active');

      return this;
    }
  });

  Y.namespace('iot.views').settings = SettingsView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-settings-list'
  ]
});

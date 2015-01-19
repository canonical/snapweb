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
        if (snap.name === 'webdm' || snap.name === 'snappyd') {
          return false;
        }
        if (snap.name.indexOf('.') === -1) {
          name = 'com.ubuntu.snappy.' + snap.name;
        } else {
          name = snap.name;
        }
        snap.name = name;
        snap.url = '/apps/' + name;
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

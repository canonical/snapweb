YUI.add('iot-views-snap-settings', function(Y) {

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var SettingsView = Y.Base.create('settingsView', Y.View, [], {

    template: mu.revive(tmpls.snap.settings.compiled),

    render: function() {
      var content = this.template();
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.snap').settings = SettingsView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-snap-settings'
  ]
});

YUI.add('iot-views-settings-nav', function(Y) {

  var views = Y.namespace('iot.views');
  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();
  var template = mu.revive(tmpls.settings.nav.compiled);
  var NavView = Y.Base.create('settingsNav', Y.View, [], {

    containerTemplate: '<nav class=layout-app-nav-primary></nav>',

    template: template,

    render: function() {
      var content = this.template(this.get('nav'));
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.settings').Nav = NavView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-settings-nav'
  ]
});

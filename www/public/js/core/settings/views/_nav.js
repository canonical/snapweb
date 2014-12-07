YUI.add('core-settings-view-nav', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.SETTINGS.TMPL.NAV.template);

  NavView = Y.Base.create('settingsNav', Y.View, [], {

    containerTemplate: '<nav class=layout-app-nav-primary></nav>',

    template: template,

    render: function() {
      var content = this.template(this.get('nav'));
      this.get('container').setHTML(content);

      return this;
    }
  });

}, '0.0.1', {
  requires: [
    'view',
    'template'
  ]
});

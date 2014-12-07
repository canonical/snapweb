YUI.add('core-settings-view-list', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.SETTINGS.TMPL.LIST.template);

  var ListView = Y.Base.create('settingsList', Y.View, [], {

    containerTemplate: '<main class=layout-content></main>',
    template: template,

    render: function() {
      var content = this.template(this.get('list'));
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.SETTINGS.VIEWS').List = ListView;

}, '0.0.1', {
  requires: [
    'view',
    'template'
  ]
});

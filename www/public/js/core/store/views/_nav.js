YUI.add('core-store-view-nav', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.STORE.TMPL.NAV.template);

  var NavView = Y.Base.create('storeNav', Y.View, [], {

    containerTemplate: '<nav class=layout-app-nav-primary></nav>',

    template: template,

    render: function() {
      var content = this.template(this.get('nav'));
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.STORE.VIEWS').Nav = NavView;

}, '0.0.1', {
  requires: [
    'view',
    'template'
  ]
});

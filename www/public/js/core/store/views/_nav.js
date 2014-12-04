YUI.add('core-store-view-nav', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.STORE.TMPL.NAV.template);

  NavView = Y.Base.create('storeNav', Y.View, [], {

    containerTemplate: '<nav class=layout-nav-deutero></nav>',

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

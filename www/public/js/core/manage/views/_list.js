YUI.add('core-manage-view-snaplist', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.MANAGE.TMPL.LIST.template);

  SnapListView = Y.Base.create('snapListView', Y.View, [], {

    containerTemplate: '<nav class=layout-nav-deutero></nav>',

    template: template,

    render: function() {
      var content = this.template(this.get('snapList'));
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

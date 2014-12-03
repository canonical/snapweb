YUI.add('core-manage-view-snap', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.MANAGE.TMPL.SNAP.template);

  SnapView = Y.Base.create('snapView', Y.View, [], {

    containerTemplate: '<main class=layout-content></main>',
    template: template,

    render: function() {
      var content = this.template(this.get('snap'));
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

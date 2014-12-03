YUI.add('core-manage-view-snap', function(Y) {

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.SNAPS.TMPL.SNAP.template);

  SnapView = Y.Base.create('snapView', Y.View, [], {

    template: template,

    render: function() {
      var content = this.template({});
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

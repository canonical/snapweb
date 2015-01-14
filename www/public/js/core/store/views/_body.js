YUI.add('iot-views-snap-body', function(Y) {

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var BodyView = Y.Base.create('bodyView', Y.View, [], {

    template: mu.revive(tmpls.snap.body.compiled),

    render: function() {
      var content = this.template(this.get('model').getAttrs());
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.snap').body = BodyView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-snap-body'
  ]
});

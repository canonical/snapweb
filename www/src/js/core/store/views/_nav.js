YUI.add('iot-views-snap-details', function(Y) {

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var DetailsView = Y.Base.create('detailsView', Y.View, [], {

    template: mu.revive(tmpls.snap.details.compiled),

    render: function() {
      var content = this.template(this.get('model').getAttrs());
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.snap').details = DetailsView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-snap-details'
  ]
});

YUI.add('iot-views-snap-reviews', function(Y) {

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var ReviewsView = Y.Base.create('reviewsView', Y.View, [], {

    template: mu.revive(tmpls.snap.reviews.compiled),

    render: function() {
      // we have no review data
      var content = this.template();
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.snap').reviews = ReviewsView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-snap-reviews'
  ]
});

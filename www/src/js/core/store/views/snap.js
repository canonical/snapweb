YUI.add('iot-views-snap', function(Y) {

  var views = Y.namespace('iot.views.snap');

  var SnapView = Y.Base.create('snap', Y.View, [], {

    initializer: function() {
      var model = this.get('model');

      this.bodyView = new views.body({
        model: model
      });
      this.detailsView = new views.details({
        model: model
      });
      this.reviewsView = new views.reviews();
      this.settingsView = new views.settings();

      this.bodyView.addTarget(this);
      this.detailsView.addTarget(this);
      this.reviewsView.addTarget(this);
      this.settingsView.addTarget(this);
    },

    destructor: function() {
      this.bodyView.destroy();
      this.detailsView.destroy();
      this.reviewsView.destroy();
      this.settingsView.destroy();
      delete this.bodyView;
      delete this.detailsView;
      delete this.reviewsView;
      delete this.settingsView;
    },

    render: function() {

      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.bodyView.render().get('container'));

      if (this.get('settings')) {
        content.append(this.settingsView.render().get('container'));
      } else if (this.get('reviews')) {
        content.append(this.reviewsView.render().get('container'));
      } else {
        content.append(this.detailsView.render().get('container'));
      }
      this.get('container').setHTML(content);

      return this;
    }

  });

  Y.namespace('iot.views.snap').snap = SnapView;

}, '0.0.1', {
  requires: [
    'view',
    'iot-views-snap-body',
    'iot-views-snap-details',
    'iot-views-snap-reviews',
    'iot-views-snap-settings'
  ]
});

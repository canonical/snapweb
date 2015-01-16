YUI.add('iot-views-snap', function(Y) {

  var views = Y.namespace('iot.views.snap');

  var SnapView = Y.Base.create('snap', Y.View, [], {

    initializer: function() {
      var model = this.get('model');

      if (model) {
        model.addTarget(this);
      }

      this.after('*:change', this.render, this);

      this.bodyView = new views.body({
        model: model
      });
      this.detailsView = new views.details({
        model: model
      });
      this.reviewsView = new views.reviews({
        model: model
      });
      this.settingsView = new views.settings({
        model: model
      });

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

      var section = this.get('section');

      switch (section) {
        case 'settings':
          content.append(this.settingsView.render().get('container'));
          break;
        case 'reviews':
          content.append(this.reviewsView.render().get('container'));
          break;
        default:
          content.append(this.detailsView.render().get('container'));
      }

      this.get('container').setHTML(content);

      return this;
    },

    events: {
      '.install-action': {
        click: 'install'
      }
    },

    install: function(e) {
      console.log('install');
      e.preventDefault();
      var model = this.get('model');
      var installed = model.get('installed');
      var name = model.get('name').replace('com.ubuntu.snappy.', '');
      this.get('container').one('.status').set('text', '');
      e.target.addClass('thinking');

      if (installed) {
        e.target.set('text', 'Uninstalling...');
        this.removeSnap(name);
      } else {
        e.target.set('text', 'Installing...');
        this.installSnap(name);
      }
    },

    installSnap: function(name) {
      Y.io('/api/v1/packages/', {
        method: 'POST',
        data: '{"package":"' + name + '"}',
        on: {
          success: this.onInstallSuccess,
          failure: this.onInstallFailure,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        context: this
      });
    },

    removeSnap: function(name) {
      Y.io('/api/v1/packages/' + name, {
        method: 'DELETE',
        on: {
          success: this.onInstallSuccess,
          failure: this.onInstallFailure,
        },
        context: this
      });
    },

    onInstallSuccess: function() {
      var model = this.get('model');
      var installed = !model.get('installed');
      var btn = this.get('container').one('.install-action');
      var status = this.get('container').one('.status');

      model.set('installed', installed);

      if (installed) {
        btn.set('text', 'Uninstall').removeClass('thinking');
        btn.replaceClass('link-cta-positive', 'link-cta-negative');
        status.set('text', 'Successfully installed');
      } else {
        btn.set('text', 'Install').removeClass('thinking');
        btn.replaceClass('link-cta-negative', 'link-cta-positive');
        status.set('text', 'Successfully uninstalled');
      }
    },

    onInstallFailure: function() {
      var status = this.get('container').one('.status');
      status.set('text', 'There was an error installing');
    }

  });

  // XXX change this
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

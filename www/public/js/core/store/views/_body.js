YUI.add('iot-views-snap-body', function(Y) {

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var BodyView = Y.Base.create('bodyView', Y.View, [], {

    template: mu.revive(tmpls.snap.body.compiled),

    render: function() {
      var model = this.get('model');
      var installed = model.get('installed');
      var name = model.get('name').replace('com.ubuntu.snappy.', '');
      var content = this.template(this.get('model').getAttrs());
      this.get('container').setHTML(content);

      return this;
    },

    events: {
      '.link-cta-positive': {
        click: 'install'
      },
      '.link-cta-negative': {
        click: 'install'
      }
    },

    install: function(e) {
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
      model.set('installed', installed);
      var btn = null;
      var status = this.get('container').one('.status');
      if (installed) {
        btn = this.get('container').one('.link-cta-positive');
        btn.set('text', 'Uninstall').removeClass('thinking');
        btn.replaceClass('link-cta-positive', 'link-cta-negative');
        status.set('text', 'Successfully installed');
      } else {
        btn = this.get('container').one('.link-cta-negative');
        btn.set('text', 'Install').removeClass('thinking');
        btn.replaceClass('link-cta-negative', 'link-cta-positive');
        status.set('text', 'Successfully uninstalled');
      }
    },

    onInstallFailure: function() {
      var status = this.get('container').one('.status');
      status.set('text', 'There was an error installing');
    },
  });

  Y.namespace('iot.views.snap').body = BodyView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-snap-body'
  ]
});

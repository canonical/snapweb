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
      }
    },

    install: function(e) {
      e.preventDefault();
      var model = this.get('model');
      var installed = model.get('installed');
      var name = model.get('name').replace('com.ubuntu.snappy.', '');
      e.target.addClass('thinking');
      if (installed) {
        console.log('snap is installed, removing...');
        this.removeSnap(name);
      } else {
        console.log('snap is uninstalled, installing...');
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
      console.log('onInstallSuccess: installed state: ' + installed);
      var btn = this.get('container').one('.link-cta-positive');
      if (installed) {
        btn.set('text', 'Uninstall').removeClass('thinking');
      } else {
        btn.set('text', 'Install').removeClass('thinking');
      }
    },

    onInstallFailure: function() {
      console.log('onInstallFailure');
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

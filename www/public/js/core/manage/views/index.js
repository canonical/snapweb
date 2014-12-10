YUI.add('core-manage-views', function(Y) {
  'use strict';

  var ManageView = Y.Base.create('manageView', Y.View, [], {

    initializer: function() {

      this.snapListView = new SnapListView({
        snapList: this.get('snapList')
      });
      this.snapListView.addTarget(this);

      this.snapView = new SnapView({
        snap: this.get('snap')
      });
      this.snapView.addTarget(this);
    },

    destructor: function() {
      this.snapListView.destroy();
      delete this.snapListView;

      this.snapView.destroy();
      delete this.snapView;
    },

    events: {
      '.icon': {
        click: 'showSnap'
      },
      '.service .switch': {
        change: 'stopstart'
      },
      '.install .switch': {
        change: 'install'
      }
    },

    install: function(e) {
      e.stopPropagation();

      var pkgEl = e.currentTarget;
      var input = e.target;
      var label = pkgEl.one('label');
      var pkgId = input.get('id');
      var state = input.get('checked');

      pkgEl.addClass('thinking');
      input.set('disabled', true);
      label.setAttribute('data-tt', '…');

      if (state) {
        label.set('text', 'Installing package…');
        this.addPackage(pkgId);
      } else {
        label.set('text', 'Removing package…');
        this.removePackage(pkgId);
      }
    },

    addPackage: function(pkgId) {
      Y.io('/api/v1/packages/', {
        method: 'POST',
        data: '{"package":"' + pkgId + '"}',
        on: {
          success: this.onInstallSuccess,
          failure: this.onInstallFailure,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        'arguments': {
          pkgId: pkgId
        },
        context: this
      });
    },

    removePackage: function(pkgId) {
      Y.io('/api/v1/packages/' + pkgId, {
        method: 'DELETE',
        on: {
          success: this.onInstallSuccess,
          failure: this.onInstallFailure,
        },
        'arguments': {
          pkgId: pkgId
        },
        context: this
      });
    },

    onInstallSuccess: function(id, res, pkg) {
      var pkgEl = Y.one('[data-pkg="' + pkg.pkgId + '"] .switch');
      var input = pkgEl.one('input');
      var label = pkgEl.one('label');
      var state = input.get('checked');

      pkgEl.removeClass('thinking');
      input.set('disabled', false);

      if (state) {
        label.set('text', 'Package installed');
        label.setAttribute('data-tt', 'Click to remove package');
      } else {
        label.set('text', 'Package uninstalled');
        label.setAttribute('data-tt', 'Click to install again');
      }
    },

    onInstallFailure: function(id, res, pkg) {
      var pkgEl = Y.one('[data-pkg="' + pkg.pkgId + '"] .switch');
      var input = pkgEl.one('input');
      var label = pkgEl.one('label');
      var state = input.get('checked');

      pkgEl.removeClass('thinking');
      input.set('disabled', false);
      label.setAttribute('data-tt', 'Click to try again');

      if (state) {
        input.set('checked', false);
        label.set('text', 'Install failure, see console for error.');
      } else {
        input.set('checked', true);
        label.set('text',
        'Package uninstall failure, see console for error.');
      }

      console.log(res.responseText);
    },

    stopstart: function(e) {
      e.stopPropagation();

      var pkgEl = e.currentTarget;
      var input = e.target;
      var label = pkgEl.one('label');
      var pkgId = input.getAttribute('data-pkg');
      var serviceId = input.get('id').replace(/^(service-)/, '');
      var state = input.get('checked');

      pkgEl.addClass('thinking');
      input.set('disabled', true);
      label.setAttribute('data-tt', '…');

      if (state) {
        label.set('text', 'Starting service…');
      } else {
        label.set('text', 'Stopping service…');
      }

      this.setService(pkgId, serviceId, 'status', +!state);
    },

    setService: function(pkg, service, key, value) {
      Y.io(['/api/v1/packages', pkg, service].join('/'), {
        method: 'POST',
        data: '{"' + key + '":' + value + '}',
        on: {
          success: this.onServiceSuccess,
          failure: this.onServiceFailure,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        'arguments': {
          pkgId: pkg,
          serviceId: service
        },
        context: this
      });
    },

    onServiceSuccess: function(id, res, args) {
      console.log('success');
      console.log(res);
      console.log(args);
    },

    onServiceFailure: function(id, res, args) {
      var serviceEl = Y.one('[data-service=' + args.serviceId + ']');

      var input = serviceEl.one('input');
      var label = serviceEl.one('label');
      var state = input.get('checked');

      serviceEl.removeClass('thinking');
      input.set('disabled', false);
      label.setAttribute('data-tt', 'Click to try again');

      if (state) {
        input.set('checked', false);
        label.set('text', 'Service error, see console.');
      } else {
        input.set('checked', true);
        label.set('text',
        'Service error, see console.');
      }
    },

    startService: function(pkg, service) {
    },

    showSnap: function(e) {
      var name = e.target.getAttribute('data-snap');
      Y.io('/api/v1/packages/' + name, {
        on: {
          success: function(id, res) {
            var pkgData = JSON.parse(res.responseText);
            // XXX fake xkcd port
            if (pkgData.name === 'xkcd-webserver' && !pkgData.ports) {
              pkgData.ports = {
                required: '80'
              };
            }
            pkgData.url = [YUI.Env.demoUrl, pkgData.ports.required].join(':');
            this.snapView.set('snap', pkgData).render();
          },
          failure: function() {
            console.log('xhrSettings fail');
          }
        },
        context: this
      });
    },

    render: function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      var content = Y.one(Y.config.doc.createDocumentFragment());
      if (this.snapListView) {
        content.append(this.snapListView.render().get('container'));
      }
      content.append(this.snapView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.MANAGE').View = ManageView;

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'core-manage-view-snaplist',
    'core-manage-view-snap'
  ]
});

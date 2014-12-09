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
      '.switch': {
        change: 'stopstart'
      }
    },

    stopstart: function(e) {
      e.stopPropagation();

      var pkgEl = e.currentTarget;
      var input = e.target;
      var label = pkgEl.one('label');
      var pkgId = input.getAttribute('data-pkg');
      var serviceId = input.get('id');
      var state = input.get('checked');

      console.log(state);

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

    onServiceSuccess: function(id, res, pkg, service) {
      console.log(pkg);
      console.log(service);
      console.log(res);
    },

    onServiceFailure: function() {
      console.log('failure');
    },

    startService: function(pkg, service) {
    },

    showSnap: function(e) {
      var name = e.target.getData('snap');
      Y.io('/api/v1/packages/' + name, {
        on: {
          success: function(id, res) {
            this.snapView.set('snap', JSON.parse(res.responseText)).render();
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

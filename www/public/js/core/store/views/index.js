YUI.add('core-store-views', function(Y) {
  'use strict';

  var StoreView = Y.Base.create('storeView', Y.View, [], {

    initializer: function() {

      var VIEWS = Y.DEMO.CORE.STORE.VIEWS;

      this.listView = new VIEWS.List({
        list: this.get('list')
        });
      this.navView = new VIEWS.Nav({
        nav: this.get('nav')
      });

      this.listView.addTarget(this);
      this.navView.addTarget(this);
    },

    destructor: function() {
      this.listView.destroy();
      this.navView.destroy();

      delete this.listView;
      delete this.navView;
    },

    events: {
      '.switch': {
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

    render: function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.navView.render().get('container'));
      content.append(this.listView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.STORE.VIEWS').Store = StoreView;

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'core-store-view-list',
    'core-store-view-nav'
  ]
});

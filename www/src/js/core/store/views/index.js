YUI.add('core-store-views', function(Y) {
  'use strict';

  var StoreView = Y.Base.create('storeView', Y.View, [], {

    initializer: function() {

      this.listView = new ListView({
        list: this.get('list')
        });
      this.navView = new NavView({
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
      '.button-install': {
        click: 'install'
      },
      '.button-uninstall': {
        click: 'uninstall'
      }
    },

    install: function(e) {
      var name = e.target.getData('pkg');
      Y.one('[data-pkg="' + name + '"]')
      .replaceClass('uninstalled', 'working');

      Y.io('/api/v1/packages/', {
        method: 'POST',
        data: '{"package":"' + name + '"}',
        on: {
          success: function(id, res, pkg) {
            Y.one('[data-pkg="' + pkg.name + '"]')
            .replaceClass('working', 'installed');
          },
          failure: function(id, res, pkg) {
            Y.one('[data-pkg="' + pkg.name + '"]')
            .replaceClass('working', 'uninstalled');
          }
        },
        headers: {
          'Content-Type': 'application/json',
        },
        context: StoreView,
        'arguments': {
          name: name
        }
      });
    },

    uninstall: function(e) {
      var name = e.target.getData('pkg');
      Y.one('[data-pkg="' + name + '"]')
      .replaceClass('installed', 'working');

      Y.io('/api/v1/packages/' + name, {
        method: 'DELETE',
        on: {
          success: function(id, res, pkg) {
            Y.one('[data-pkg="' + pkg.name + '"]')
            .replaceClass('working', 'uninstalled');
          },
          failure: function(id, res, pkg) {
            Y.one('[data-pkg="' + pkg.name + '"]')
            .replaceClass('working', 'installed');
          }
        },
        context: StoreView,
        'arguments': {
          name: name
        }
      });
    },

    render: function() {
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.navView.render().get('container'));
      content.append(this.listView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.STORE').View = StoreView;

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'core-store-view-list',
    'core-store-view-nav'
  ]
});

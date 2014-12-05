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
      input.set('disabled', '');

      if (state) {
        label.set('text', 'Installing package…');
      } else {
        label.set('text', 'Removing package…');
      }

      Y.io('/api/v1/packages/', {
        method: 'POST',
        data: '{"package":"' + pkgId + '"}',
        on: {
          success: function(id, res, pkg) {
            var pkgEl = Y.one('[data-pkg="' + pkg.pkgId + '"] .switch');
            var input = pkgEl.one('input');
            var label = pkgEl.one('label');
            var state = input.get('checked');

            pkgEl.removeClass('thinking');

            if (state) {
              label.set('text', 'Package installed');
            } else {
              label.set('text', 'Package removed');
            }
          },
          failure: function(id, res, pkg) {
            console.log(res);
            var pkgEl = Y.one('[data-pkg="' + pkg.pkgId + '"] .switch');
            var input = pkgEl.one('input');
            var label = pkgEl.one('label');
            var state = input.get('checked');

            pkgEl.removeClass('thinking');

            if (state) {
              input.set('checked', false);
              label.set('text', 'Install failure, see console for error.');
            } else {
              input.set('checked', true);
              label.set('text',
              'Package uninstall failure, see console for error.');
            }

            console.log(res.responseText);
          }
        },
        headers: {
          'Content-Type': 'application/json',
        },
        'arguments': {
          pkgId: pkgId
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

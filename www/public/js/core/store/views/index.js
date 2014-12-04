YUI.add('core-store-views', function(Y) {
  'use strict';

  var StoreView = Y.Base.create('storeView', Y.View, [], {

    initializer: function() {

      console.log(this.get('nav'));

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
      }
    },

    install: function(e) {
      var name = e.target.getData('pkg');
      Y.io('/api/v1/packages/', {
        method: 'POST',
        data: 'package=' + name,
        on: {
          success: function(id, res) {
            console.log(res);
          },
          failure: function(id, res) {
            console.log(res);
            console.log('xhrSettings fail');
          }
        },
        context: this
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

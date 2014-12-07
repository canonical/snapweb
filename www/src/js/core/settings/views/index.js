YUI.add('core-settings-views', function(Y) {
  'use strict';

  var StoreView = Y.Base.create('settingsView', Y.View, [], {

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

    render: function() {
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.navView.render().get('container'));
      content.append(this.listView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.SETTINGS').View = StoreView;

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'core-settings-view-list',
    'core-settings-view-nav'
  ]
});

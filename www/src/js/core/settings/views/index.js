YUI.add('iot-views-settings', function(Y) {
  'use strict';

  var views = Y.namespace('iot.views.settings');

  views.Index = Y.Base.create('settingsView', Y.View, [], {

    initializer: function() {

      this.listView = new views.List({
        list: this.get('list')
        });
      this.navView = new views.Nav({
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
      document.body.scrollTop = document.documentElement.scrollTop = 0;

      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.navView.render().get('container'));
      content.append(this.listView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'iot-views-settings-list',
    'iot-views-settings-nav'
  ]
});

YUI.add('iot-views-search', function(Y) {
  'use strict';

  var views = Y.namespace('iot.views.search');

  views.Index = Y.Base.create('search', Y.View, [], {

    initializer: function() {

      this.listView = new views.List({
        list: this.get('list')
      });

      this.listView.addTarget(this);
    },

    destructor: function() {
      this.listView.destroy();

      delete this.listView;
    },

    render: function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.listView.render().get('container'));

      this.get('container').setHTML(content);

      return this;
    }
  });

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    'iot-views-search-list'
  ]
});

YUI.add('core-manage-views', function(Y) {
  'use strict';

  var ManageView = Y.Base.create('manageView', Y.View, [], {

    initializer: function() {
      this.snapListView = new SnapListView();
      this.snapView = new SnapView();
    },

    destructor: function() {
      this.snapListView.destroy();
      this.snapView.destroy();

      delete this.snapListView;
      delete this.snapView;
    },

    render: function() {
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.snapView.render().get('container'));
      content.append(this.snapListView.render().get('container'));

      this.get('container').addClass('manage-page').setHTML(content);

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

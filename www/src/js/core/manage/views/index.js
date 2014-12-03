YUI.add('core-manage-views', function(Y) {
  'use strict';

  var ManageView = Y.Base.create('manageView', Y.View, [], {

    initializer: function() {
      this.snapListView = new SnapListView({
        snapList: this.get('snapList')
        });
      this.snapView = new SnapView({
        snap: this.get('snap')
      });

      this.snapListView.addTarget(this);
      this.snapView.addTarget(this);
    },

    destructor: function() {
      this.snapListView.destroy();
      this.snapView.destroy();

      delete this.snapListView;
      delete this.snapView;
    },

    events: {
      '.icon': {
        click: 'showSnap'
      }
    },

    showSnap: function(e) {
      console.log(e.target.getData('snap'));
      this.snapView.render();
    },

    render: function() {
      var content = Y.one(Y.config.doc.createDocumentFragment());
      content.append(this.snapView.render().get('container'));
      content.append(this.snapListView.render().get('container'));

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

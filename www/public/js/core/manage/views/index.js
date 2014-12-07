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
      content.append(this.snapListView.render().get('container'));
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

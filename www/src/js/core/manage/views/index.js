YUI.add('core-manage-views', function(Y) {
  'use strict';

  var ManageView = Y.Base.create('manageView', Y.View, [], {

    initializer: function() {

      var snapList = this.get('snapList');
      if (snapList && snapList.length) {
        this.snapListView = new SnapListView({
          snapList: snapList
        });
        this.snapListView.addTarget(this);
      }

      this.snapView = new SnapView({
        snap: this.get('snap')
      });
      this.snapView.addTarget(this);
    },

    destructor: function() {
      if (this.snapListView) {
        this.snapListView.destroy();
        delete this.snapListView;
      }

      this.snapView.destroy();
      delete this.snapView;
    },

    events: {
      '.icon': {
        click: 'showSnap'
      },
      '.switch': {
        change: 'stopstart'
      }
    },

    stopstart: {
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
      if (this.snapListView) {
        content.append(this.snapListView.render().get('container'));
      }
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

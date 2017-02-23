// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var SnapListView = require('../components/snaplist.js');

var SnapListView = require('./snaplist.js');
var SystemSnapsView = require('./system-snaps.js');
var SnapTools = require('../common/snaps.js')

var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    // TODO if collection empty use emptyView

    this.showChildView('installedRegion', new SnapListView({
      doNotDisplayEmptyList: true,
      model: this.model,
      collection: new Backbone.Collection(
        this.collection.filter(
          function(m) {
            return m.get('type') == 'app' && m.get('id') != 'snapweb';
          }
        )
      )
    }));

    this.showChildView('systemSnapsRegion', new SystemSnapsView({
      model: this.model,
      collection: new Backbone.Collection(
        new Backbone.Collection(
          this.collection.filter(
            function(m) {
              return m &&
                ((m.get('type') != 'app' && m.get('type') != 'gadget') ||
                 (m.get('id') == 'snapweb'));
            }
          )
        ).each(function(snap) {
          snap.set('targetSnapUri', SnapTools.getShowSnapUrlFor(snap))
        })
      )
    }));
  },

  regions: {
    installedRegion: '.region-installed',
    systemSnapsRegion: '.region-system-snaps',
  },
});

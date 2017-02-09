// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var SnapListView = require('./snaplist.js');
var SystemSnapsView = require('./system-snaps.js');

var template = require('../templates/home.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  template : function(model) {
    return template(model);
  },

  onBeforeShow: function() {
    // TODO if collection empty use emptyView

    this.showChildView('installedRegion', new SnapListView({
      model: this.model,
      collection: new Backbone.Collection(
        this.collection.filter(
          function(m) {
            return m.get('type') == 'app';
          }
        )
      )
    }));

    this.showChildView('systemSnapsRegion', new SystemSnapsView({
      model: this.model,
      collection: new Backbone.Collection(
        this.collection.filter(
          function(m) {
            return m && m.get('type') != 'app' && m.get('type') != 'gadget';
          }
        )
      )
    }));
  },

  regions: {
    installedRegion: '.region-installed',
    systemSnapsRegion: '.region-system-snaps',
  },
});

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-updates.hbs');
var updatesTableTemplate = require('../templates/settings-updates-table.hbs');
var updatesItemTemplate = require('../templates/settings-updates-item.hbs');
var historyTableTemplate = require('../templates/settings-history-table.hbs');
var historyItemTemplate = require('../templates/settings-history-item.hbs');

var UpdatesItemView = Backbone.Marionette.ItemView.extend({
  tagName: 'tr',

  events: {
    'click button': 'updateSnap'
  },

  template: function(model) {
    return updatesItemTemplate(model);
  },

  updateSnap: function() {
    this.model.save({'version': this.model.get('version')}, {patch: true});
  }
});

var UpdatesCollectionView = Backbone.Marionette.CompositeView.extend({
  childView: UpdatesItemView,
  childViewContainer: '#settings-update-table',

  template: function() {
    return updatesTableTemplate();
  }
});

var HistoryItemView = Backbone.Marionette.ItemView.extend({
  tagName: 'tr',

  template: function(model) {
    return historyItemTemplate(model);
  }
});

var HistoryCollectionView = Backbone.Marionette.CompositeView.extend({
  childView: HistoryItemView,
  childViewContainer: '#settings-history-table',

  template: function() {
    return historyTableTemplate();
  }
});

module.exports = Backbone.Marionette.LayoutView.extend({
  className: 'b-settings__updates',

  events: {
    'click #updates-update-all': 'updateAll'
  },

  initialize: function(options) {
    this.collection = options.collection;
    this.history = options.history;
  },

  template: function(model) {
    return template(model);
  },

  onRender: function() {
    if (this.collection.length == 0) {
      this.$('#updates-update-all').attr('disabled', true);
      this.$('#available-table-container').
        append('<div id="updates-message">No updates available</div>');
    } else {
      this.showChildView('updates-table', new UpdatesCollectionView({
            collection: this.collection
          }));
    }
    if (this.history.length == 0) {
      this.$('#history-table-container').
        append('<div id="history-message">' +
               'No history information available</div>');
    } else {
      this.showChildView('history-table', new HistoryCollectionView({
              collection: this.history
            }));
    }
  },

  updateAll: function() {
    this.collection.each(function(snap) {
          snap.save({'version': snap.get('version')}, {patch: true});
        });
  },

  regions: {
    'updates-table': '#available-table-container',
    'history-table': '#history-table-container'
  }

});

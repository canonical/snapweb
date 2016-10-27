// snaplist view
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var SnaplistItemView = require('../views/snaplist-item.js');
var EmptySnaplistView = require('./empty-snaplist.js');
var template = require('../templates/snaplist.hbs');
var CONF = require('../config.js');

module.exports = Marionette.CompositeView.extend({

  childViewContainer: '#js-snaplist',

  template : function(model) {
    return template(model);
  },

  ui: {
    'sortAlpha': '#sortAlpha',
    'sortBytes': '#sortBytes',
    'styleRow': '#js-style-row',
    'styleGrid': '#js-style-grid'
  },

  events: {
    'click @ui.sortBytes':  'sortBytes',
    'click @ui.sortAlpha':  'sortAlpha',
    'click @ui.styleRow':   'styleRow',
    'click @ui.styleGrid':  'styleGrid'
  },

  sortAlpha: function() {
    this.model.set('isAlpha', true);
    this.viewComparator = function(model) {
      return model.get('name');
    };
    this.render();
  },

  sortBytes: function() {
    this.model.set('isAlpha', false);
    this.viewComparator = function(model) {
      return -model.get('installed_size');
    };
    this.render();
  },

  styleGrid: function() {
    this.model.set('isGrid', true);
    this.$('#js-snaplist')
      .removeClass('p-card-deck--row');

    this.$('#js-view-filters')
      .removeClass('p-view-filters--row')
      .addClass('p-view-filters--grid');
  },

  styleRow: function() {
    this.model.set('isGrid', false);
    this.$('#js-snaplist')
      .addClass('p-card-deck--row');

    this.$('#js-view-filters')
      .removeClass('p-view-filters--grid')
      .addClass('p-view-filters--row');

    console.log('done1');
  },

  childView: SnaplistItemView,

  emptyView: EmptySnaplistView

});

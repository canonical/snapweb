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

  childViewContainer: '.b-snaplist',

  template : function(model) {
    return template(model);
  },

  ui: {
    'sortAlpha': '#sortAlpha',
    'sortBytes': '#sortBytes',
    'styleRow': '#styleRow',
    'styleGrid': '#styleGrid'
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

    this.$('.b-snaplist')
    .removeClass('b-snaplist_row')
    .addClass('b-snaplist_grid');

    this.$('#styleRow').removeClass('b-button_active');
    this.$('#styleGrid').addClass('b-button_active');
  },

  styleRow: function() {
    this.model.set('isGrid', false);

    this.$('.b-snaplist')
    .removeClass('b-snaplist_grid')
    .addClass('b-snaplist_row');

    this.$('#styleGrid').removeClass('b-button_active');
    this.$('#styleRow').addClass('b-button_active');
  },

  childView: SnaplistItemView,

  emptyView: EmptySnaplistView

});

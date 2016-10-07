// search bar component
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/search-bar.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-search-bar',

  template: function(model) {
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

    $('.b-snaplist').removeClass('b-snaplist_row').addClass('b-snaplist_grid');

    $('#styleRow').removeClass('b-button_active');
    $('#styleGrid').addClass('b-button_active');
  },

  styleRow: function() {
    this.model.set('isGrid', false);

    $('.b-snaplist').removeClass('b-snaplist_grid').addClass('b-snaplist_row');

    $('#styleGrid').removeClass('b-button_active');
    $('#styleRow').addClass('b-button_active');
  },
});

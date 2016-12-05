// search bar component
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/search-bar.hbs');

var SectionsListItemView = Marionette.ItemView.extend({
  tagName: 'li',
  template: _.template('<a href="<%= link %>"><%= text %></a>'),
  className: 'p-inline-list__item'
});

var SectionsListItemView = Marionette.CollectionView.extend({
  childView: SectionsListItemView,
  tagName: 'ul',
  className: 'p-inline-list u-float--right',
});

module.exports = Backbone.Marionette.LayoutView.extend({
  className: 'b-search-bar',

  template: function(model) {
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

  onBeforeShow: function() {
    // TODO adjust sections to collections
    var sections = this.model.get('sections') || (new Backbone.Model())
    sections = _.map(sections.toJSON(), function(s) {
      var section = _.reduce(s, function(r, v, k) {
        return r + v
      }, '');
      return {'link': '/store/section/' + section, 'text': section}
    });
    // add private to it
    sections.push({'link': '/store/section/private', 'text': 'private'});
    this.showChildView(
      'sectionsViewRegion',
      new SectionsListItemView({
        model: this.model,
        collection: new Backbone.Collection(sections),
      })
    );
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
  },

  regions: {
    sectionsViewRegion: '#sections-view',
  },
});

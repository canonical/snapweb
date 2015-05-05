// snap layout view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var SnapMenuView = require('./snap-menu.js');
var SnapDetailView = require('./snap-detail.js');
var SnapReviewsView = require('./snap-reviews.js');
var SnapSettingsView = require('./snap-settings.js');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');
var chan = Radio.channel('root');

module.exports = Marionette.LayoutView.extend({

  initialize: function() {
    this.listenTo(
      this.model, 'change:message', this.onModelError
    );
  },

  behaviors: {
    InstallBehavior: {
      behaviorClass: InstallBehavior
    }
  },

  onShow: function() {
    window.scrollTo(0, 0);
  },


  onModelError: function(model) {
    chan.command('alert:error', model);
  },

  className: 'b-snap',

  ui: {
    menu: '.b-snap__nav-item'
  },

  events: {
    'click @ui.menu': 'section'
  },

  template: function(model) {
    /**
     * use pretty-bytes on size, when available
     * https://www.npmjs.com/package/pretty-bytes
     *
     * mode.size_human = prettyBytes(model.size)
    **/
    return template(model);
  },

  onBeforeShow: function() {
    var tabView = this._getSectionView(this.options.section);
    this.showChildView('menuRegion',
      new SnapMenuView({
        section: this.options.section
      })
    );
    this.showChildView('tabRegion', tabView);
  },

  regions: {
    menuRegion: '.region-menu',
    tabRegion: '.region-tab'
  },

  _getSectionView: function(section) {
    var view;
    switch (section) {
      case 'reviews':
        view = new SnapReviewsView();
        break;
      case 'settings':
        view = new SnapSettingsView();
        break;
      default:
        view = new SnapDetailView({model: this.model});
    }
    return view;
  },

  section: function(e) {
    e.preventDefault();
    var section = e.target.getAttribute('href');
    var view = this._getSectionView(section);
    var name = this.model.get('name');
    // XXX url sane
    var url = 'snap/' + name + '/' + section;
    // if section is already in place, don't showChildView
    var re = new RegExp('/' + section + '$', 'i');
    if (!re.test(Backbone.history.fragment)) {
      this.showChildView('tabRegion', view);
      Backbone.history.navigate(url);
    }
  }
});

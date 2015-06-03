// snap layout view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Handlebars = require('hbsfy/runtime');
var SnapMenuView = require('./snap-menu.js');
var SnapDetailView = require('./snap-detail.js');
var SnapReviewsView = require('./snap-reviews.js');
var SnapSettingsView = require('./snap-settings.js');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');

Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));

module.exports = Marionette.LayoutView.extend({

  behaviors: {
    InstallBehavior: {
      behaviorClass: InstallBehavior
    }
  },

  onShow: function() {
    window.scrollTo(0, 0);
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
    var tabView = this.getSectionView(this.options.section);
    this.showChildView('menuRegion',
      new SnapMenuView({
        model: this.model,
        section: this.options.section
      })
    );
    this.showChildView('tabRegion', tabView);
  },

  regions: {
    menuRegion: '.region-menu',
    tabRegion: '.region-tab'
  },

  getSectionView: function(section) {
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
    if (!e.target.getAttribute('target')) {
      e.preventDefault();
      var section = e.target.getAttribute('href');
      var view = this.getSectionView(section);
      var name = this.model.get('id');
      // XXX url sane
      var url = 'snap/' + name + '/' + section;
      // if section is already in place, don't showChildView
      var re = new RegExp('/' + section + '$', 'i');
      if (!re.test(Backbone.history.fragment)) {
        this.showChildView('tabRegion', view);
        Backbone.history.navigate(url);
      }
    }
  }
});

// snap layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapMenuView = require('./snap-menu.js');
var SnapDetailView = require('./snap-detail.js');
var SnapReviewsView = require('./snap-reviews.js');
var SnapSettingsView = require('./snap-settings.js');
var template = require('../templates/snap-layout.hbs');

module.exports = Marionette.LayoutView.extend({

  className: 'snap-layout',

  ui: {
    install: '.snap--install',
    menu: '.snap--menu'
  },

  events: {
    'click @ui.install': 'install',
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
    this.showChildView('menuRegion', new SnapMenuView());
    this.showChildView('tabRegion', tabView);
  },

  regions: {
    menuRegion: '.region-menu',
    tabRegion: '.region-tab'
  },

  install: function() {
    var installed = this.model.get('status');

    if (installed === 'installed') {
      // uninstall
      this.model.destroy({
        success: function(model, response, opts) {
          var status = opts.xhr.status;
          if (status === 200) {
          }
        },
        error: function(model, response, opts) {
        }
      });
    } else {
      // install
      this.model.save();
    }
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
        view = new SnapDetailView({ model: this.model });
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
    // XXX if section is already in place, don't showChildView
    this.showChildView('tabRegion', view);
    Backbone.history.navigate(url);
  } 
});

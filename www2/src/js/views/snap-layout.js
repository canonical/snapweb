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
    install: ".snap--install"
  },

  events: {
    'click @ui.install': 'install'
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
  /**
   * if (this.active === 'detail') {
   *  tabView = new SnapDetailView({ model: this.model });
   * }
   */
    this.showChildView('menuRegion', new SnapMenuView());
    this.showChildView('tabRegion', new SnapDetailView({
      model: this.model
    }));
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
  }
});

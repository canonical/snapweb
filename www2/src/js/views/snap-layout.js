// snap layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapMenuView = require('./snap-menu.js');
var SnapDetailView = require('./snap-detail.js');
var SnapReviewsView = require('./snap-reviews.js');
var SnapSettingsView = require('./snap-settings.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');

module.exports = Marionette.LayoutView.extend({

  initialize: function() {
    //this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change:status', this.handleModelChangeStatus);
  },

  onShow: function() {
    window.scrollTo(0, 0);
  },

  handleModelChangeStatus: function(model) {
    var state = model.changed.status;
    var msg = model.get('install_msg');
    var installEl = this.ui.install;

    if (state === CONF.INSTALL_STATE.INSTALLING ||
        state === CONF.INSTALL_STATE.UNINSTALLING) {
      installEl.addClass('thinking').text(msg);
    } else {
      installEl.removeClass('thinking').text(msg);
    }

  },

  className: 'snap-layout',

  ui: {
    statusMessage: '.left .status',
    install: '.install-action',
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
    var status = this.model.get('status');
    console.log('install: ', status);

    if (status === CONF.INSTALL_STATE.INSTALLED) {
      // uninstall
      this.model.set({
        status: CONF.INSTALL_STATE.UNINSTALLING
      });
      this.model.destroy({
        success: function() {
        },
        failure: function() {
        }
      });
    } else if (status === CONF.INSTALL_STATE.UNINSTALLED) {
      // install
      console.log('aaa');
      console.log(this.model);
      this.model.save({
        status: CONF.INSTALL_STATE.INSTALLING
      }, {
        dataType : 'html'
      });
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

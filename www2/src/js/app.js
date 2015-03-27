// app.js

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var baseTemplate = require('./templates/base.hbs');
var snapTemplate = require('./templates/snap.hbs');
var homeTemplate = require('./templates/home.hbs');
var settingsTemplate = require('./templates/system-settings.hbs');
var imageTemplate = require('./templates/systemimage.hbs');
var storeTemplate = require('./templates/store.hbs');

var webdm = new Marionette.Application();

webdm.on('start', function() {
  Backbone.history.start({pushState: true});
});

webdm.addRegions({
  mainRegion: '#region-main'
});

/** Snap Model
 *
 * var helloWorld = new Snap({id: 'hello-world'});
 *
 * // fetch from server (http GET)
 * helloWorld.fetch({
 *   success: function(snap) {
 *     console.log(snap);
 *   }
 * });
 *
 * // install (http PUT)
 * // uninstall (http DELETE)
 * // upgrade (http UPGRADE)
 *
 **/

var Snap = Backbone.Model.extend({
  urlRoot: '/api/v2/packages/'
});

var System = Backbone.Model.extend({
  urlRoot: '/api/v1/systemimage/'
});

// collection

// collective noun for group of crocs is a 'bask'
var Bask = Backbone.Collection.extend({
  url: '/api/v2/packages/',
  model: Snap
});

// views

var AppLayoutView = Backbone.Marionette.LayoutView.extend({
  className: 'webdm',
  template : function() {
    return baseTemplate();
  },
  regions: {
    contentRegion: '.region-content'
  }
});

var HomeLayoutView = Backbone.Marionette.LayoutView.extend({
  className: 'view-home',
  template : function() {
    return homeTemplate();
  },
  regions: {
    installedRegion: '.region-installed'
  }
});

var SettingsLayoutView = Backbone.Marionette.LayoutView.extend({
  className: 'view-home',
  template : function() {
    return settingsTemplate();
  },
  regions: {
    systemSettingsRegion: '.region-system-settings',
    installedRegion: '.region-installed'
  }
});

var StoreLayoutView = Backbone.Marionette.LayoutView.extend({
  className: 'store',
  template : function() {
    return storeTemplate();
  },
  regions: {
    productRegion: '.region-product'
  }
});

var SnapView = Marionette.ItemView.extend({
  className: 'snap',
  template: function(model) {
    return snapTemplate(model);
  },
  ui: {
   icon: '.snap--icon',
   name: '.snap--name'
  },
  events: {
    'click': 'open',
    'mouseover @ui.icon': 'hoverIcon',
    'mouseover @ui.name': 'hoverName'
  },
  hoverIcon: function(e) {
    console.log(this.model.get('name'));
  },
  open: function(e) {
    console.log('open');
    console.log(e);
    console.log(this);
  }
});

var BaskView = Marionette.CollectionView.extend({
  className: 'bask',
  childView: SnapView,
});

// setup app view

var appLayoutView = new AppLayoutView();
webdm.mainRegion.show(appLayoutView);

// router

var webdmRouter = new Marionette.AppRouter({
  controller: {
    'home': function() {
      console.log('home route');
      var homeBask = new Bask();
      var homeLayoutView = new HomeLayoutView();
      appLayoutView.contentRegion.show(homeLayoutView);

      homeBask.fetch({
        data: $.param({
          'types': ['app'],
          'installed_only': true
        }),
        success: function(bask) {
          var homeBaskView = new BaskView({
            collection: bask
          });
          homeLayoutView.installedRegion.show(homeBaskView);
        }
      });

    },
    'store': function() {
      console.log('store route');
      var storeBask = new Bask();
      var storeLayoutView = new StoreLayoutView();
      appLayoutView.contentRegion.show(storeLayoutView);

      storeBask.fetch({
        success: function(bask) {
          var storeBaskView = new BaskView({
            collection: bask
          });
          storeLayoutView.productRegion.show(storeBaskView);
        }
      });

    },
    'app': function(name) {
      console.log('app');
    },
    'appSection': function(name, section) {
      console.log('appSection');
    },
    'systemSettings': function() {
      console.log('system-settings');
      var installedBask = new Bask();
      var system = new System();
      var settingsLayoutView = new SettingsLayoutView();

      var SystemSettingsView = Backbone.Marionette.ItemView.extend({
        template: function(model) {
          return imageTemplate(model);
        },
      });

      appLayoutView.showChildView('contentRegion', settingsLayoutView);

      // TODO installed snaps bask, same as we get for home...
      //
      var installedFetch = {
        data: $.param({
          'types': ['app'],
          'installed_only': true
        })
      };

      $.when(installedBask.fetch(installedFetch), system.fetch()).done(
        function() {
          console.log('done');
          var installedBaskView = new BaskView({
            collection: installedBask
          });
          var systemSettingsView = new SystemSettingsView({
            model: system
          });
          settingsLayoutView.showChildView('installedRegion',
          installedBaskView);
          settingsLayoutView.showChildView('systemSettingsRegion',
          systemSettingsView);
        }).fail(function() {
          alert('error, couldn\'t load data');
        });

      /**
      settingsBask.fetch({
        data: $.param({
          'types': ['app'],
          'installed_only': true
        }),
        success: function(bask) {
          var installedBaskView = new BaskView({
            collection: bask
          });
          settingsLayoutView.installedRegion.show(installedBaskView);
        }
      });
      **/
    }
  },
  appRoutes: {
    '': 'home',
    'store': 'store',
    'apps/:name': 'app',
    'apps/:name/:section': 'appSection',
    'system-settings': 'systemSettings'
  }
});

$(document).ready(function() {
  webdm.start();
});

// Load some initial data, and then start our application
// loadInitialData().then(app.start);

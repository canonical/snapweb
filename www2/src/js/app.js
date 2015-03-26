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
var homeTemplate = require('./templates/home.hbs');
var snapTemplate = require('./templates/snap.hbs');

var webdm = new Marionette.Application();

webdm.on('start', function() {
  Backbone.history.start({pushState: true});
});

webdm.addRegions({
  mainRegion: '#region-main'
});

// model

var Snap = Backbone.Model.extend({
  urlRoot: '/api/v2/packages/'
});

var helloWorld = new Snap({id: 'hello-world'});
helloWorld.fetch({
  success: function(snap) {
    console.log(snap);
  }
});

// collection

// collective noun for group of crocs is a 'bask'
var Bask = Backbone.Collection.extend({
  url: '/api/v2/packages/',
  model: Snap
});

// views

var AppLayoutView = Backbone.Marionette.LayoutView.extend({
  template : function() {
    return baseTemplate({name: 'Stephen'});
  },
  regions: {
    contentRegion: '#region-content'
  }
});

var HomeLayoutView = Backbone.Marionette.LayoutView.extend({
  template : function() {
    return homeTemplate();
  },
  regions: {
    baskRegion: '#region-bask'
  }
});

var SnapView = Marionette.ItemView.extend({
  template: function(model) {
    return snapTemplate(model);
  }
});

var BaskView = Marionette.CollectionView.extend({
  childView: SnapView
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

      homeBask.fetch({
        success: function(bask) {
          var homeBaskView = new BaskView({
            collection: bask
          });
          homeLayoutView.baskRegion.show(homeBaskView);
        }
      });

      appLayoutView.contentRegion.show(homeLayoutView);
    },
    'store': function() {
      console.log('store route');
      console.log(arguments);
    },
    'app': function(name) {
      console.log('app');
      console.log(name);
    },
    'appSection': function(name, section) {
      console.log('appSection');
      console.log(name, section);
    }
  },
  appRoutes: {
    '': 'home',
    'store': 'store',
    'apps/:name': 'app',
    'apps/:name/:section': 'appSection'
  }
});

$(document).ready(function() {
  webdm.start();
});

// Load some initial data, and then start our application
// loadInitialData().then(app.start);

// router.js

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var homeController = require('../controllers/home.js');
var searchController = require('../controllers/search.js');
var storeController = require('../controllers/store.js');
var systemController = require('../controllers/system.js');
var snapController = require('../controllers/snaps.js');

module.exports = {

  home: new Marionette.AppRouter({
    controller: homeController,
    appRoutes: {
      '': 'index'
    }
  }),

  store: new Marionette.AppRouter({
    controller: storeController,
    appRoutes: {
      'store': 'index'
    }
  }),

  system: new Marionette.AppRouter({
    controller: systemController,
    appRoutes: {
      'system-settings': 'index'
    }
  }),

  snap: new Marionette.AppRouter({
    controller: snapController,
    appRoutes: {
      'snap/:id': 'snap',
    }
  }),

  search: new Marionette.AppRouter({
    controller: searchController,
    appRoutes: {
      'search?q=:query': 'query',
    }
  })
};

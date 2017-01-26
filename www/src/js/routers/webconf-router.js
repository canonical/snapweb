// webconf-router.js

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var webconfController = require('../controllers/webconf.js');

module.exports = {

  home: new Marionette.AppRouter({
    controller: webconfController,
    appRoutes: {
      '': 'index'
    }
  }),

};

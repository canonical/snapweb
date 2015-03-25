// router.js

var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

module.exports = Marionette.AppRouter.extend({
  appRoutes: {
    '': 'foo'
  },
});

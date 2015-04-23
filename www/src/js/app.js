// app.js

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var RootView = require('./views/root.js');
var router = require('./routers/router.js');

var webdm = new Marionette.Application();
var rootView = new RootView();
rootView.render();

webdm.on('start', function() {
  Backbone.history.start({pushState: true});
});

$(document).ready(function() {
  webdm.start();
});

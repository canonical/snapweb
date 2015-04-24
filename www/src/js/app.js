// app.js

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var MainView = require('./views/layout-main.js');
var router = require('./routers/router.js');

var webdm = new Marionette.Application();
var mainView = new MainView();
mainView.render();

webdm.on('start', function() {
  Backbone.history.start({pushState: true});
});

$(document).ready(function() {
  webdm.start();
});

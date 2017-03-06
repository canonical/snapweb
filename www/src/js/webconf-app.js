// webconf-app.js
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');

if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var LayoutView = require('./views/webconf-layout.js');
var router = require('./routers/webconf-router.js');

var webconf = new Marionette.Application();
var layout = new LayoutView();
layout.render();

$(document).ready(function() {
  webconf.start();
});

webconf.on('start', function() {
  Backbone.history.start({pushState: true});
});

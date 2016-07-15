// app.js
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var chan = Radio.channel('root');
var CONF = require('./config.js');
if (window.__agent) {
  window.__agent.start(Backbone, Marionette);
}
var LayoutView = require('./views/layout.js');
var router = require('./routers/router.js');

var snapweb = new Marionette.Application();
var layout = new LayoutView();
layout.render();

$(document).ready(function() {
  snapweb.start();
});

snapweb.on('start', function() {
  Backbone.history.start({pushState: true});
});

chan.comply('redirect:sso', function() {
  window.location = CONF.SSO_URL;
});

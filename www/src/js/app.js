// app.js
'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');

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

$( document ).ajaxError(function( event, jqxhr, settings, exception ) {
    if (jqxhr.status === 401 && window.location.pathname != '/access-control') {
      window.location = '/access-control';
    }
});

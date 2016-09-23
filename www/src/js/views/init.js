// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var template = require('../templates/first-boot.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  events: {
    'click @ui.create': 'handleCreate',
  },

  ui: {
    create: '.btn-create',
  },

  handleCreate: function() {
    console.log('create button pressed');
    event.preventDefault();
  },

  template : function() {
    console.log('in init.js/template');
    return template();
  },

});

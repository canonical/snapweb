// home view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SnapListView = require('./snaplist.js');
var template = require('../templates/first-boot.hbs');

module.exports = Backbone.Marionette.LayoutView.extend({

  className: 'b-layout__container',

  template : function() {
    console.log('in init.js/template');
    return template();
  },

});

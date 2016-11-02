var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var SectionsItemView = require('../views/store-sections-item.js');
var template = require('../templates/store-header.hbs');

module.exports = Marionette.CompositeView.extend({

  childViewContainer: '.b-sections-list',

  template : function(model) {
    return template(model);
  },

  childView: SectionsItemView,
});

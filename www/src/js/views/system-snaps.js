var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var template = require('../templates/system-snaps.hbs');
var SystemSnaplistItemView = require('../views/system-snaps-item.js');

module.exports = Marionette.CompositeView.extend({

  className: 'row',

  childViewContainer: '#systems-snap-list',

  template : function(model) {
    return template(model);
  },

  childView: SystemSnaplistItemView,
});

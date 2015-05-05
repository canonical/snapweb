// snap item view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/snaplist-item.hbs');
var snapChannel = Radio.channel('snap');

module.exports = Marionette.ItemView.extend({

  className: 'b-snaplist__item',

  template: function(model) {
    return template(model);
  },

  events: {
    'click': 'showSnap'
  },

  showSnap: function(e) {
    e.preventDefault();
    snapChannel.command('show', this.model);
  }
});

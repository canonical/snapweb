// snap item view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/snap-item.hbs');
var snapChannel = Radio.channel('snap');

module.exports = Marionette.ItemView.extend({

  className: 'three-col',

  tagName: 'li',

  template: function(model) {
    return template(model);
  },

  ui: {
    icon: '.b-bask__snap-icon',
    name: '.b-bask__snap-name'
  },

  events: {
    'click': 'command',
    'mouseover @ui.icon': 'hoverIcon',
    'mouseover @ui.name': 'hoverName'
  },

  command: function(e) {
    e.preventDefault();
    snapChannel.command('show', this.model);
  },

  hoverIcon: function(e) {
    console.log(this.model.get('name'));
  }
});

// store bask snap view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var template = require('../templates/store-bask-item.hbs');
var snapChannel = Radio.channel('snap');

module.exports = Marionette.ItemView.extend({
  className: 'box search-results__list--item',
  tagName: 'li',
  template: function(model) {
    return template(model);
  },
  ui: {
    icon: '.store-bask__snap-icon',
    name: '.store-bask__snap-name'
  },
  events: {
    'click': 'showSnap',
    'mouseover @ui.icon': 'hoverIcon',
    'mouseover @ui.name': 'hoverName'
  },
  hoverIcon: function(e) {
    console.log(this.model.get('name'));
  },
  showSnap: function(e) {
    e.preventDefault();
    snapChannel.command('show', this.model);
  },
});

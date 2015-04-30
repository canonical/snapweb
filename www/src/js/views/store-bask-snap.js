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
  events: {
    'click': 'showSnap'
  },
  showSnap: function(e) {
    e.preventDefault();
    snapChannel.command('show', this.model);
  },
});

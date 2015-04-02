// snap view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-item.hbs');

module.exports = Marionette.ItemView.extend({
  className: 'snap-item',
  template: function(model) {
    return template(model);
  },
  ui: {
    icon: '.snap-item--icon',
    name: '.snap-item--name'
  },
  events: {
    'click': 'open',
    'mouseover @ui.icon': 'hoverIcon',
    'mouseover @ui.name': 'hoverName'
  },
  hoverIcon: function(e) {
    console.log(this.model.get('name'));
  },
  open: function(e) {
    console.log('open');
    console.log(e);
    console.log(this);
  }
});

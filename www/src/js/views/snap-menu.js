// snap menu view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/snap-menu.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  onShow: function() {
    this.setActiveNav(this.options.section);
  },

  className: 'b-snap__navigation',

  events: {
    'click': 'onNavClick'
  },

  template: function() {
    return template();
  },

  onNavClick: function(e) {
    var link = e.target.getAttribute('href');
    this.setActiveNav(link);
  },

  setActiveNav: function(link) {
    link = link || 'details';
    var toActiveSelector = '[href=' + link + ']';
    var activeClass = 'b-snap__nav-item--active';
    var activeSelector = '.' + activeClass;
    this.$(activeSelector).removeClass(activeClass);
    this.$(toActiveSelector).addClass(activeClass);
  }
});

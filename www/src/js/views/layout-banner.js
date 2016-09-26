// banner layout view
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/layout-banner.hbs');

module.exports = Marionette.ItemView.extend({

  className: 'b-banner',

  ui: {
    input: '.b-banner__input',
    submit: '.b-banner__submit'
  },

  events: {
    'click @ui.submit': 'submit',
    'click': function(e) {
      var CLASS = 'b-banner__nav-item';
      var ACTIVE_CLASS = 'b-banner__nav-item_active';
      var navItem = e.target.closest('.' + CLASS);
      if (navItem) {
        this.$('.' + ACTIVE_CLASS).toggleClass(ACTIVE_CLASS, false);
        this.$(navItem).toggleClass(ACTIVE_CLASS, true);
      }
    }
  },

  // XXX ugh, use a model
  serializeData: function() {
    var snapweb = window.SNAPWEB;
    var path = window.location.pathname.split('/')[1];
    return {
      'query': window.decodeURI(window.location.search.slice(3)) || '',
      'name': snapweb.NAME,
      'subname': snapweb.SUBNAME,
      'isHomeActive': (path === ''),
      'isStoreActive': (path === 'store' || path === 'search'),
      'isSettingsActive': (path === 'settings')
    };
  },

  template : function(data) {
    return template(data);
  },

  submit: function(e) {
    var val = this.ui.input.val();

    if (!val) {
      e.preventDefault();
    }
  }

});

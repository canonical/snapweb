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
    var webdm = window.WEBDM;
    var path = window.location.pathname.split('/')[1];
    return {
      'query': window.decodeURI(window.location.search.slice(3)) || '',
      'name': webdm.NAME,
      'subname': webdm.SUBNAME,
      'isHomeActive': (path === ''),
      'isStoreActive': (path === 'store'),
      //'isSearchActive': (path === 'search'),
      'isSystemActive': (path === 'system-settings')
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

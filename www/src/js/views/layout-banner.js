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
    'click @ui.submit': 'submit'
  },

  serializeData: function(){
    var webdm = window.WEBDM;
    return {
      'query': window.decodeURI(window.location.search.slice(3)) || '',
      'name': webdm.NAME,
      'subname': webdm.SUBNAME,
      'active': window.location.pathname.split('/')[0]
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

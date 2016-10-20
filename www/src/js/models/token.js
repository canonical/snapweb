var Backbone = require('backbone');
var Cookies = require("js-cookie");

module.exports = Backbone.Model.extend({

  url: '/api/v2/validate-token',

  // forces POST requests on every model update
  isNew: function() {
    return true;
  },

  setCookie: function(token) {
    Cookies.set('SM', token);    
  },
  
});


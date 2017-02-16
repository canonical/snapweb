// create-user API

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

module.exports = Backbone.Model.extend({
  url: '/api/v2/create-user',

  // forces POST requests on every model update
  isNew: function() {
    return true;
  },

  validate: function(attrs) {
    var emailPattern = /^[\w\-]{1,}([\w\-\+.]{1,1}[\w\-]{1,}){0,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/;
    if (typeof attrs.email == 'undefined') {
      return 'Empty email';
    }
    if (!attrs.email.match(emailPattern)) {
      return 'Invalid email';
    }
  },
  
});

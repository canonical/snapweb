var _ = require('lodash');
var Backbone = require('backbone');
var Radio = require('backbone.radio');
var chan = Radio.channel('root');

var ProfileModelSingleton = Backbone.Model.extend({
  initialize: function() {
    // add to the snapweb global object
    var snapweb = window.SNAPWEB;
    snapweb.sharedProfile = this;
  },

  defaults: {
    // email: "", // ie, not logged in
    email: "anthony.chang@ubuntu.com",
    username: "achang",
    avatarUrl: "http://www.gravatar.com/avatar/3b3be63a4c2a439b013787725dfce802",
    fullName: "Anthony Chang",
    isLoggedIn: true,
  },
  
  sync: function(method, model, options) {
    // don't use the default REST/URL mapping
    // this is only a local model for now
  },

  logout: function() {
    this.clear();
    chan.command('profile:change', this);
  }
  
});

module.exports = new ProfileModelSingleton();

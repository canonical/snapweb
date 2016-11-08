// snaplist.js
// collective noun for group of crocs is a 'snaplist' :)

var Backbone = require('backbone');
var Snap = require('../models/snap.js');
var CONF = require('../config.js');

module.exports = Backbone.Collection.extend({
  url: CONF.PACKAGES,
  model: Snap,
  installed: function() {
      return new this.constructor(
          this.where({status: 'installed'}).slice(
              0,
              this.limits.installedSnapListMaxItems))
  },
  private: function() {
      return new this.constructor(
          this.where({private: true}).slice(
              0,
              this.limits.installedSnapListMaxItems))
  },
  all: function() {
      return new this.constructor(
          this.slice(
              0,
              this.limits.installedSnapListMaxItems));
  },
  comparator: function(model) {
    return model.get('name');
  },
  limits: {
      installedSnapListMaxItems: 20
  },
});

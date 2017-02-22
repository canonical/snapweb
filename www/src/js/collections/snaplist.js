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
      this.filter(function(m) {
        var s = m.get('status')
        return s === 'installed' || s === 'active'
      }).slice(0, this.limits.installedSnapListMaxItems))
  },
  all: function() {
    return new this.constructor(
      this.slice(0, this.limits.installedSnapListMaxItems));
  },
  comparator: function(model) {
    return model.get('name');
  },
  limits: {
    installedSnapListMaxItems: 20
  },
});

// snap layout view
var _ = require('lodash');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Handlebars = require('hbsfy/runtime');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snap-layout.hbs');
var CONF = require('../config.js');

Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));

module.exports = Marionette.LayoutView.extend({

  behaviors: {
    InstallBehavior: {
      behaviorClass: InstallBehavior
    }
  },

  onShow: function() {
    window.scrollTo(0, 0);
  },

  className: 'b-snap',

  template: function(model) {
    /**
     * use pretty-bytes on size, when available
     * https://www.npmjs.com/package/pretty-bytes
     *
     * mode.size_human = prettyBytes(model.size)
    **/
    return template(model);
  }
});

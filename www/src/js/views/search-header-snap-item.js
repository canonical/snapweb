// snap matched item view
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var Handlebars = require('hbsfy/runtime');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snaplist-matched-item.hbs');
var snapChannel = Radio.channel('snap');
var ComparisonHBSHelpers = require('handlebars-helpers').comparison();

Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));

module.exports = Marionette.ItemView.extend({

  className: 'b-snaplist__item',

  template: function(model) {
    return template(model);
  },

  events: {
    'click': 'showSnap'
  },

  behaviors: {
    InstallBehavior: {
      behaviorClass: InstallBehavior
    }
  },

  showSnap: function(e) {
    e.preventDefault();
    if (!$(e.target).is('.b-installer__button')) {
      snapChannel.command('show', this.model);
    }
  }
});

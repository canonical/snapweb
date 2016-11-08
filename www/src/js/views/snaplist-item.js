// snap item view
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var Handlebars = require('hbsfy/runtime');
var InstallBehavior = require('../behaviors/install.js');
var template = require('../templates/snaplist-item.hbs');
var snapChannel = Radio.channel('snap');

Handlebars.registerPartial('installer', require('../templates/_installer.hbs'));

module.exports = Marionette.ItemView.extend({

  className: function() {
    var type = this.model.get('type');
    var className = 'p-card';

    if (type) {
      className += ' p-card-' + type;
    }

    return className;
  },

  template: function(model) {
    return template(model);
  },

  ui: {
    'snapTitle': '#js-snap-title'
  },

  events: {
    'click @ui.snapTitle':  'showSnap'
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

// infobar view
var _ = require('lodash');
var $ = require('jquery');
var moment = require('moment');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var template = require('../templates/layout-infobar.hbs');

module.exports = Marionette.ItemView.extend({

  initialize: function() {
  },

  ui: {
    'datetime': '.b-infobar__datetime'
  },

  className: 'b-infobar',

  template : function(data) {
    return template(data);
  },

  serializeData: function() {
    return {
      datetime: this.getDatetime
    };
  },

  onDomRefresh: function() {
    this.updateClock();
  },

  onBeforeDestroy: function() {
    clearTimeout(this.timeoutID);
  },

  getDatetime: function() {
    return moment().format('ddd, MMMM Do YYYY, h:mm:ss a');
  },

  updateClock: function() {
    var now = this.getDatetime();
    this.ui.datetime.text(now);
    this.timeoutID = setTimeout(_.bind(this.updateClock, this), 1000);
  }

});

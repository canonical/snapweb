// main layout view
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactDOM = require('react-dom');
var Radio = require('backbone.radio');
var NotificationsView = require('./alerts.js');
var chan = Radio.channel('root');

module.exports = Marionette.LayoutView.extend({

  initialize: function(options) {
    this.externalRender = options.render;
    chan.comply('set:content', this.setContent, this);
    chan.comply('alert:error', this.alertError, this);
  },

  template : function() {
    return '';
  },

  attachElContent: function(html) {
    this.externalRender(html);
    return this;
  },

  setContent: function(content) {
    var reactElement = content.reactElement || null;
    if (reactElement !== null) {
      ReactDOM.render(reactElement, $('.App-main').get(0));
    } else {
        console.log("mainRegion.show?");
        this.mainRegion.show(content.backboneView);
    }
  },

  alertError: function(model) {
    this.showChildView('alertsRegion', new NotificationsView({
      model: model
    }));
  },

  regions: {
    mainRegion:     '.App-main',
    alertsRegion:   '.b-layout__alerts'
  }
});

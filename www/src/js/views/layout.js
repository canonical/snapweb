// main layout view
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var BannerView = require('./layout-banner.js');
var FooterView = require('./layout-footer.js');
var AlertView = require('./alerts.js');
var template = require('../templates/layout.hbs');
var chan = Radio.channel('root');
var NotificationsModel = require('../models/notifications.js');
var NotificationsView = require('./notifications.js');

module.exports = Marionette.LayoutView.extend({

  initialize: function() {
    chan.comply('set:content', this.setContent, this);
    chan.comply('alert:error', this.alertError, this);
    chan.comply('notification:closed', this.pollNotifications, this);

    this.lastNotificationCount = 0;
    this.pollNotifications();
  },

  el: '.b-layout',

  template : function() {
    return template();
  },

  onRender: function() {
    this.showChildView('bannerRegion', new BannerView());
    this.showChildView('footerRegion', new FooterView());
  },

  setContent: function(content) {
    this.mainRegion.show(content);
  },

  alertError: function(model) {
    this.showChildView('alertsRegion', new AlertView({
      model: model
    }));
  },

  displayNotification: function(model) {
    this.showChildView('notificationsRegion', new NotificationsView({
      model: model
    }));
  },

  pollNotifications: function() {
    if (this.pollingIntervalId)
      return;
    this.notificationsModel = new NotificationsModel;
    this.pollingIntervalId = setInterval(function() {
        this.notificationsModel.fetch({
          success: function(model) {
            var updatesAvailable = model.get('updatesAvailable') || 0;
            if (updatesAvailable > 0 && this.lastNotificationCount < updatesAvailable) {
              clearInterval(this.pollingIntervalId);
              this.lastNotificationCount = updatesAvailable;
              this.pollingIntervalId = null;
              this.displayNotification(model);
            }
          }.bind(this),
          error: function() { }
        });
      }.bind(this), 10000);
  },

  regions: {
    bannerRegion:   '.b-layout__banner',
    mainRegion:     '.b-layout__main',
    footerRegion:   '.b-layout__footer',
    alertsRegion:   '.b-layout__alerts',
    notificationsRegion: '.b-layout__notifications'
  }
});

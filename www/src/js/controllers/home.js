var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var Radio = require('backbone.radio');
var HomeLayoutView = require('../views/home.js');
var Bask = require('../collections/snaplist.js');
var BrandingData = require('../models/branding.js');

module.exports = {
  index: function() {
    var chan = Radio.channel('root');
    var installedBask = new Bask();
    var brandingData = new BrandingData({}, {parse: true});

    $.when(
        installedBask.fetch({data: $.param({'installed_only': true})})
        , brandingData.fetch()
    ).then(function() {
        var view = new HomeLayoutView({
            collection: installedBask.installed(),
            brandingData: brandingData,
        });
        chan.command('set:content', view);
    });
  }
};

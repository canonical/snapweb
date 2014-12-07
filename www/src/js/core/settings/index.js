YUI.add('core-settings', function(Y) {
  'use strict';

  // TODO get settings ai
  // TODO get settings state
  var app = Y.DEMO.app;
  var mu = new Y.Template();

  // TODO use Attr on Base with a Settings class so as not to clobber (and confuse devs) app
  app.on('settingsChange', function(e) {
    // TODO compate old and new, only act on diff
    var data = e.newVal;
    // TODO revived template store
    var template = mu.revive(Y.DEMO.CORE.SETTINGS.TMPL.LIST.template);
    var html = template({
      groups: data
    });
    Y.one('.layout-app-nav-primary').setHTML(html);
  });

  // fired when the settings button is clicked, which was populated with data-attrs
  // which include the module name to load and the fn to fire, in this case show()
  var show = function() {
    // get settings data to paint the menus and forms
    Y.io('/mock-api/settings.json', {
      on: {
        success: onSuccess,
        failure: function() {
          console.log('xhrSettings fail');
        }
      }
    });
  };

  var onSuccess = function(id, res) {
    app.set('settings', Y.JSON.parse(res.responseText));
  };

  var page = function(api) {
    var settings = app.get('settings');
    var data;

    settings.every(function(group) {
      return group.items.every(function(pageData) {
        if (pageData.api === api) {
          data = pageData;
          return false;
        }
        return true;
      });
    });

    if (data) {
      var view = new Y.DEMO.CORE.SETTINGS.View({data: data});
      app.showView(view, null, {render: true});
    } else {
      console.error('ach, no data');
    }
  };

  Y.namespace('DEMO.CORE.SETTINGS').show = show;
  Y.namespace('DEMO.CORE.SETTINGS').page = page;

}, '0.0.1', {
  requires: [
    'io',
    'model',
    'demo-config',
    'core-settings-views',
    't-core-settings-tmpl-list'
  ]
});

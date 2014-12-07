YUI.add('core-settings-views', function(Y) {
  'use strict';

  var template = new Y.Template();
  template = template.revive(Y.DEMO.CORE.SETTINGS.TMPL.FORM.template);

  var SettingsView = Y.Base.create('settingsView', Y.View, [], {

    template: template,

    events: {
      '#submit': {
        click: 'submit'
      }
    },

    onSubmitSuccess: function(id, res) {
      var data = JSON.parse(res.responseText);
      window.alert(data.message);
    },

    submit: function() {

      var postUri = this.get('data.api');
      postUri = Y.namespace(postUri).post;

      Y.io(postUri, {
        method: 'POST',
        form: {
          id: 'demo-settings'
        },
        on: {
          success: this.onSubmitSuccess,
          failure: function(id, res) {
            console.log('failure');
            console.log(res);
          }
        }
      });
    },

    render: function() {
      var settings = this.get('data');
      var html = template(settings);

      this.get('container').setHTML(html);

      return this;
    }
  });

  Y.namespace('DEMO.CORE.SETTINGS').View = SettingsView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    'io-base'
  ]
});

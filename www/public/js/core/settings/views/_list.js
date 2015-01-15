YUI.add('iot-views-settings-list', function(Y) {

  var views = Y.namespace('iot.views');
  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();
  var template = mu.revive(tmpls.settings.list.compiled);
  var ListView = Y.Base.create('settingsList', Y.View, [], {

    template: template,

    render: function() {
      var content = this.template(this.get('list'));
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.settings').List = ListView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-settings-list'
  ]
});

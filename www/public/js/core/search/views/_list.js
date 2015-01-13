YUI.add('iot-views-search-list', function(Y) {

  var views = Y.namespace('iot.views');
  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();
  var template = mu.revive(tmpls.search.list.compiled);
  var ListView = Y.Base.create('searchList', Y.View, [], {

    containerTemplate: '<main class=layout-content></main>',
    template: template,

    render: function() {
      var content = this.template(this.get('list'));
      this.get('container').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views.search').List = ListView;

}, '0.0.1', {
  requires: [
    'view',
    'template',
    't-tmpls-search-list'
  ]
});

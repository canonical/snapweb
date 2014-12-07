YUI.add('demo-view-home', function(Y) {
  'use strict';
  var mu = new Y.Template();

  Y.namespace('DEMO.VIEW').Home = Y.Base.create('home', Y.View, [], {

    render: function() {
      var template = mu.revive(Y.DEMO.MAIN.TMPL.HOME.template);
      var html = template();
      this.get('container').setHTML(html);

      return this;
    }
  });
}, '0.0.1', {
  requires: [
    'template',
    't-main-tmpl-home'
  ]
});

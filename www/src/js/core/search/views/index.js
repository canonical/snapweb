YUI.add('iot-views-search', function(Y) {
  'use strict';

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var SearchView = Y.Base.create('search', Y.View, [], {

    template: mu.revive(tmpls.search.list.compiled),

    render: function() {

      document.body.scrollTop = document.documentElement.scrollTop = 0;

      var list = this.get('modelList');

      var queryString = this.get('queryString');
      console.log('searchString');

      if (list.isEmpty()) {
        Y.one('.search-results')
        .setHTML('<p>Sorry, no results found for "' + queryString + '"');
        return this;
      }

      var listData = list.map(function(snap) {
        return snap;
      });

      var content = this.template(listData);
      Y.one('.search-results').setHTML(content);

      return this;
    }
  });

  Y.namespace('iot.views').search = SearchView;

}, '0.0.1', {
  requires: [
    'view',
    'io-base',
    't-tmpls-search-list'
  ]
});

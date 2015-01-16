YUI.add('iot-views-search', function(Y) {
  'use strict';

  var tmpls = Y.namespace('iot.tmpls');
  var mu = new Y.Template();

  var SearchView = Y.Base.create('search', Y.View, [], {

    template: mu.revive(tmpls.search.list.compiled),

    destroy: function() {
      this.get('container').setHTML();
      Y.one('header.banner').removeClass('to-close');
      return Y.View.superclass.destroy.call(this);
    },

    render: function() {

      document.body.scrollTop = document.documentElement.scrollTop = 0;

      var list = this.get('modelList');
      var listData;
      var queryString = this.get('queryString');
      var content;

      Y.one('header.banner').addClass('to-close');

      if (list.isEmpty()) {
        content =
        '<div class="row"><div class="inner-wrapper"><p>' +
          'Sorry, no results found for "' +
          queryString + '"</p></div></div>';
      } else {
        listData = list.map(function(snap) {
          return snap;
        });
        content = this.template(listData);
      }

      this.get('container').setHTML(content);
      return this;
    }
  }, {
    ATTRS: {
      container: {
        valueFn: function() {
          return Y.one('.search-results');
        }
      }
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

// store list item view

var SnapListItemView = require('./snaplist-item.js');
var template = require('../templates/storelist-item.hbs');

module.exports = SnapListItemView.extend({
  template: function(model) {
    return template(model);
  }
});

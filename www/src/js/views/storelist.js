// storelist view
var Snaplist = require('./snaplist.js');
var StorelistItemView = require('./storelist-item.js');

module.exports = Snaplist.extend({
  childView: StorelistItemView
});

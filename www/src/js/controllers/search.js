var $ = require('jquery');
var SnaplistTools = require('../common/snaplists.js');

module.exports = {
  query: function(q) {
    SnaplistTools.fetchSnapListView(
      'Search results for "' + q  + '"',
      q,
      {data: $.param({'q': q})}
    );
  }
};

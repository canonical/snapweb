var $ = require('jquery');
var SnaplistTools = require('../common/snaplists.js');

module.exports = {
  index: function() {
    SnaplistTools.fetchSnapListView(
      'Featured snaps',
      '',
      {data: $.param({'section': 'featured'})}
    );
  },
  section: function(s) {
    // Special case for private section which is not a section
    // per se but a specificity of a snap
    if (s === 'private') {
      SnaplistTools.fetchSnapListView(
        'Private snaps',
        '',
        {data: $.param({'private_snaps': true})}
      );
    }
    else {
      SnaplistTools.fetchSnapListView(
        s,
        '',
        {data: $.param({'section': s})}
      );
    }
  }
};

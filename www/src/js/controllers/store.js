var $ = require('jquery');
var SnaplistTools = require('../common/snaplists.js');

// TODO factor code a bit more

module.exports = {
  index: function() {
    var section = 'featured';
    SnaplistTools.fetchSnapListView('', section, {data: $.param({'section': section})});
  },
  section: function(s) {
    // Special case for private section which is not a section
    // per se but a specificity of a snap
    var data = {data: $.param({'section': s})};
    if (s === 'private') {
      data = {data: $.param({'private_snaps': true})};
    }
    SnaplistTools.fetchSnapListView(s, '', data);
  }
};

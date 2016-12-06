var Config = require('../config.js');
var Snap = require('./snap.js')

var LocalSnap = Snap.extend({
  idAttribute: 'name',
  urlRoot: Config.LOCAL_SNAPS,

  parse: function(response) {
    if (response == undefined) {
      // Can be here after a NoContent from patch.
      return;
    }
    LocalSnap.__super__.parse.call(this, response)
  }
});

module.exports = LocalSnap;

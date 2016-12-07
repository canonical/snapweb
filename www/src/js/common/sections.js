var $ = require('jquery');
var Config = require('../config.js');

module.exports = {
  fetch: function() {
    return $.get(Config.SECTIONS)
  }
}
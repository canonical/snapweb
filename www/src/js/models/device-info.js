// snap.js

var Backbone = require('backbone');
var Radio = require('backbone.radio');
var CONF = require('../config.js');
var chan = Radio.channel('root');

module.exports = Backbone.Model.extend({

  urlRoot: CONF.DEVICE_INFO,

});


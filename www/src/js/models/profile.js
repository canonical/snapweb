var _ = require('lodash');
var Backbone = require('backbone');
var Radio = require('backbone.radio');
var prettyBytes = require('pretty-bytes');
var CONF = require('../config.js');
var chan = Radio.channel('root');

module.exports = Backbone.Model.extend({

  urlRoot: CONF.PROFILE,

});

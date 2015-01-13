/**
 * precompile Y.Template.Micro templates 
 */

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var Micro = require('yui/template-micro').Template.Micro;
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-yui-precompile';

function gulpPrecompiler() {
  'use strict';
  var postfixText = new Buffer('});');

  var stream = through.obj(function(file, enc, cb) {

    if (file.isNull()) {
      console.log('empty file');
    }

    if (file.isBuffer()) {

      var name = path.relative(file.base, file.path);
      var ns;
      ns = name = name.replace(path.extname(name), '').split(path.sep);
      ns = ['iot'].concat(ns).join('.').toLowerCase();

      name.unshift('t');
      name = name.join('-');
      gutil.log('Created template module: ', gutil.colors.yellow(name));
      gutil.log('  with namespace: ', gutil.colors.yellow(ns));

      var text = 'YUI.add("' + name +
        '", function(Y) { Y.namespace("' + ns + '").compiled = ';
      var prefixText = new Buffer(text);

      file.contents = Buffer.concat([
        prefixText,
        new Buffer(Micro.precompile(file.contents + '')),
        postfixText
      ]);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported', {
        fileName: file.path,
        showStack: false
      }));
    }

    this.push(file);

    return cb();
  });

  return stream;
}

module.exports = gulpPrecompiler;

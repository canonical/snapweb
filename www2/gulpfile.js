var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var aliasify = require('aliasify');

var bundler = watchify(browserify('./src/js/app.js', watchify.args));
bundler.transform('hbsfy');
bundler.transform({global: true}, 'aliasify');

gulp.task('js', bundle); // so you can run `gulp js` to build the file

bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('webdm.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./public/js/'));
}

gulp.task('default', ['js']);

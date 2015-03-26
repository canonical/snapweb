var aliasify = require('aliasify');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var bundler = watchify(browserify('./src/js/app.js', watchify.args));
bundler.transform('hbsfy');
bundler.transform({global: true}, 'aliasify');

gulp.task('js', ['js:lint'], bundle);

bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('webdm.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(uglify())
      .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./public/js/'));
}

gulp.task('js:lint', function() {
  return gulp.src(['src/js/**/*.js'])
    .pipe(jscs())
    .on('error', function(err) {
      gutil.log(gutil.colors.green(err));
      this.emit('end');
    })
    .pipe(jshint());
});

// Styles

gulp.task('styles', ['styles:clean'], function() {
  return gulp.src(['src/css/**/*.css'])
  .pipe(csso())
  .pipe(autoprefixer())
  .pipe(concat('webdm.css'))
  .pipe(gulp.dest('public/css'));
});

gulp.task('styles:clean', function(cb) {
  del(['public/css'], cb);
});

// Images

gulp.task('images', ['images:clean'], function() {
  gulp.src(['src/images/**/*'])
  .pipe(imagemin())
  .pipe(gulp.dest('public/images'));
});

gulp.task('images:clean', function(cb) {
  del(['public/images'], cb);
});

gulp.task('default', ['js', 'styles', 'images']);

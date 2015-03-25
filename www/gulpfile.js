// gulpfile.js - streaming build system for client side assets

var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var precompile = require('./precompile.js');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var svgSymbols = require('gulp-svg-symbols');
var uglify = require('gulp-uglify');

// where to find sources
var paths = {
  js: ['src/js/**/*.js'],
  css: ['src/css/**/*.css'],
  imgs: ['src/images/**/*'],
  templates: ['src/js/**/*.html'] // html to be compiled to js tmpl func
};


gulp.task('image', function() {
  gulp.src(paths.imgs)
  .pipe(imagemin())
  .pipe(gulp.dest('public/images'));
});

gulp.task('scripts', ['clean:scripts'], function() {
  return gulp.src(paths.js)
  .pipe(jscs())
  .on('error', function(err) {
    gutil.log(gutil.colors.green(err));
    this.emit('end');
  })
  .pipe(jshint())
//  .pipe(sourcemaps.init())
//  .pipe(uglify())
//  .on('error', function(err) {
//    gutil.log(gutil.colors.green(err));
//    this.emit('end');
//  })
//  .pipe(sourcemaps.write({debug: false}))
  .pipe(gulp.dest('public/js'));
});

gulp.task('clean:scripts', function(cb) {
  del([
  '!public/js/tmpls',
  'public/js/**'
  ], cb);
});

gulp.task('styles', ['clean:styles'], function() {
  return gulp.src(paths.css)
  .pipe(csso())
  .pipe(autoprefixer())
  .pipe(concat('webdm.css'))
  .pipe(gulp.dest('public/css'));
});

gulp.task('clean:styles', function(cb) {
  del(['public/css'], cb);
});

gulp.task('templates', ['clean:templates'], function() {
  return gulp.src(paths.templates)
  .pipe(precompile())
  //.pipe(uglify())
  .on('error', function(err) {
    gutil.log(gutil.colors.green(err));
    this.emit('end');
  })
  .pipe(rename({
    extname: '.js'
  }))
  .pipe(gulp.dest('public/js'));
});

gulp.task('clean:templates', function(cb) {
  del(['public/js/tmpls'], cb);
});

// create a smaller yui lib (leave out debug and raw)
gulp.task('yui', ['clean:yui'], function() {
  return gulp.src([
    'node_modules/yui/**/*-min.js',
    'node_modules/yui/**/*-min.css'
  ])
  .pipe(gulp.dest('public/vendor/yui'));
});

gulp.task('clean:yui', function(cb) {
  del(['public/vendor/yui'], cb);
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.css, ['styles']);
  gulp.watch(paths.imgs, ['image']);
  gulp.watch(paths.templates, ['templates']);
});

gulp.task('build', ['yui', 'scripts', 'styles', 'image', 'templates']);
gulp.task('watch', ['build', 'watch']);
gulp.task('default', ['build']);

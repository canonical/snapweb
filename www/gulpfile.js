// gulpfile.js - streaming build system for client side assets

var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var precompile = require('./precompile.js');
var rename = require('gulp-rename');
var scp = require('gulp-scp');
var sourcemaps = require('gulp-sourcemaps');
var svgSymbols = require('gulp-svg-symbols');
var uglify = require('gulp-uglify');

// where to find sources
var paths = {
  js: ['src/js/**/*.js'],
  css: ['src/css/**/*.css'],
  templates: ['src/js/**/*.html'] // html to be compiled to js tmpl func
};

gulp.task('clean', function(cb) {
  del(['public'], cb);
});

gulp.task('scripts', function() {
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

gulp.task('styles', function() {
  return gulp.src(paths.css)
  .pipe(csso())
  .pipe(autoprefixer())
  .pipe(concat('demo.css'))
  .pipe(gulp.dest('public/css'));
});

gulp.task('templates', function() {
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

gulp.task('svg', function() {
  return gulp.src('src/img/*.svg')
  .pipe(svgSymbols())
  .pipe(gulp.dest('public/svg'));
});

// create a smaller yui lib (leave out debug and raw)
gulp.task('yui', function() {
  return gulp.src([
    'node_modules/yui/**/*-min.js',
    'node_modules/yui/**/*-min.css'
  ])
  .pipe(gulp.dest('public/vendor/yui'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.css, ['styles']);
  gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', ['watch', 'scripts', 'styles', 'templates']);

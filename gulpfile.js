var aliasify = require('aliasify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var bemlinter = require('postcss-bem-linter');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var customMedia = require('postcss-custom-media');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

gulp.task('js:build', ['js:clean', 'js:lint'], function() {
  return createBundler();
});

gulp.task('js:watch', ['js:lint'], function() {
  createBundler(true);
});

gulp.task('js:clean', function(cb) {
  del(['www/public/js'], cb);
});

function createBundler(watch) {
  var bundler = browserify('./www/src/js/app.js', {
    cache: {},
    packageCache: {}
  });
  bundler.transform('hbsfy');
  bundler.transform({global: true}, 'aliasify');

  if (watch) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
      bundleShared(bundler);
    });
    bundler.on('log', gutil.log);
  } else {
  }

  return bundleShared(bundler);
}

function bundleShared(bundler) {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('snapweb.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(uglify())
      .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('www/public/js/'));
}

gulp.task('js:lint', function() {
  return gulp.src(['www/src/js/**/*.js'])
    .pipe(jscs())
    .on('error', function(err) {
      gutil.log(gutil.colors.green(err));
      this.emit('end');
    })
    .pipe(jshint());
});

// Styles


gulp.task('styles', ['styles:clean'], function() {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    bemlinter('bem'),
    customMedia({
      extensions: {
        '--xxs':   '(min-width:  ' + calcWidth(4,8) + 'px)',
        '--xs':    '(min-width:  ' + calcWidth(5,9) + 'px)',
        '--s':     '(min-width:  ' + calcWidth(6,10) + 'px)',
        '--m':     '(min-width:  ' + calcWidth(7) + 'px)',
        '--l':     '(min-width:  ' + calcWidth(9) + 'px)',
        '--xl':    '(min-width:  ' + calcWidth(11) + 'px)',
        '--xxl':   '(min-width:  ' + calcWidth(13) + 'px)',
        '--xxxl':  '(min-width:  ' + calcWidth(15) + 'px)'
      }
    })
  ];

  function calcWidth(units, padding, width) {
    var scrollbar = 17;
    width = width || 90; // width of an icon in grid style
    padding = padding || 10;

    return (((width + (padding*2)) * units) + (scrollbar * 2));
  }

  return gulp.src([
    'node_modules/normalize.css/normalize.css',
    'www/src/css/lib/vanilla-includes.scss',
    'www/src/css/**/*.css'
  ])
  .pipe(sass())
  .pipe(sourcemaps.init())
  .pipe(postcss(processors))
  .pipe(csso())
  .pipe(concat('snapweb.css'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('www/public/css'));
});

gulp.task('styles:clean', function(cb) {
  del(['www/public/css'], cb);
});

// Images

gulp.task('images', ['images:clean'], function() {
  gulp.src(['www/src/images/**/*'])
  .pipe(imagemin())
  .pipe(gulp.dest('www/public/images'));
});

gulp.task('images:clean', function(cb) {
  del(['www/public/images'], cb);
});

gulp.task('watch', ['js:watch', 'styles', 'images'], function() {
  gulp.watch('www/src/images/**/*.{svg,png,jpg,jpeg}', ['images']);
  gulp.watch('www/src/css/**/*.css', ['styles']);
  gulp.watch('www/src/js/**/*.js', ['js:lint']);
});

gulp.task('default', ['js:build', 'styles', 'images']);

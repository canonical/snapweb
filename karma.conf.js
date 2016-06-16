// Karma configuration
// Generated on Fri Mar 27 2015 18:06:02 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-ajax', 'jasmine', 'browserify'],

    // list of files / patterns to load in the browser
    files: [
    /**
      {
        pattern: 'test/*.html',
        watched: true,
        included: false,
        served: true
      },
      **/
      'www/tests/**/*Spec.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'www/tests/**/*.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],

    // web server port
    port: 9876,

    // setting this seems required to run on Travis though possible values have
    // changed for recent versions of karma:
    // https://github.com/karma-runner/karma/blob/2dc4ac8dd39d014a8549e598173f9004b9b2a955/lib/config.js#L267
    transports: ['xhr-polling', 'jsonp-polling'],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    browserify: {
      debug: true,
      transform: ['hbsfy']
    }
  });
};

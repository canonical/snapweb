var $ = require('jquery');
var Backbone = require('backbone');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var moment = require('moment');

var TimeInfo = require('../src/js/models/time-info.js');
var SettingsTimeView = require('../src/js/views/settings-time.js');

describe('SettingsTimeView', function() {
  beforeEach(function() {
    this.testTime = moment().unix();
    this.model = new Backbone.Model({
          dateTime: this.testTime,
          ntp: true,
          timezone: "Pacific/Midway",
          ntpServer: "example.com"
        });

    this.elementHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(SettingsTimeView, {
          model: this.model
        }));
  });

  afterEach(function() {
    delete this.model;
  });

  it('should display the date as provided by the model', function() {
    var matchTime = moment.unix(this.testTime).format('YYYY-MM-DD');
    expect($(this.elementHtml).find('#date-picker').val()).toMatch(matchTime);
  });

  it('should of disabled the date picker', function() {
     expect($(this.elementHtml).find('#date-picker').prop('disabled')).toBe(true);
  });

  it('should display the time as provided by model', function() {
    var matchTime = moment.unix(this.testTime).format('HH:mm:SS');
     expect($(this.elementHtml).find('#time-picker').val()).toMatch(matchTime);
  });

  it('should of disabled the time picker', function() {
     expect($(this.elementHtml).find('#time-picker').prop('disabled')).toBe(true);
  });

  it('should display the timezone as provided by the model', function() {
     expect($(this.elementHtml).find('#time-zone-select').val()).toMatch(this.model.get('timezone'));
  });

  it('should display the ntpServer as provided by the model', function() {
     expect($(this.elementHtml).find('#ntp-server-name').val()).toMatch(this.model.get('ntpServer'));
  });
});

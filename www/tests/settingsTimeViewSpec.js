var Backbone = require('backbone');
var TimeInfo = require('../src/js/models/time-info.js');
var SettingsTimeView = require('../src/js/views/settings-time.js');

describe('SettingsTimeView', function() {
  beforeEach(function() {
    this.model = new Backbone.Model({
          time: "15:04",
          date: "2006-01-02",
          timezone: "Pacific/Midway",
          ntpServer: "example.com"
        });
    this.view = new SettingsTimeView({
          model: this.model
        });
    this.view.render();
  });

  afterEach(function() {
    this.view.remove();
    delete this.model;
    delete this.view;
  });

  // Benefit of this test?
  it('should be an instance of Backbone.View', function() {
    expect(SettingsTimeView).toBeDefined();
    expect(this.view).toEqual(jasmine.any(Backbone.View));
  });

  it('should display the date as provided by the model', function() {
     expect(this.view.$el.find('#date-picker').val()).toMatch(this.model.get('date'));
  });

  it('should of disabled the date picker', function() {
     expect(this.view.$el.find('#date-picker').prop('disabled')).toBe(true);
  });

  it('should display the time as provided by model', function() {
     expect(this.view.$el.find('#time-picker').val()).toMatch(this.model.get('time'));
  });

  it('should of disabled the time picker', function() {
     expect(this.view.$el.find('#time-picker').prop('disabled')).toBe(true);
  });

  it('should display the timezone as provided by the model', function() {
     expect(this.view.$el.find('#time-zone-select').val()).toMatch(this.model.get('timezone'));
  });

  it('should display the ntpServer as provided by the model', function() {
     expect(this.view.$el.find('#ntp-server-name').val()).toMatch(this.model.get('ntpServer'));
  });
});

var TimeTools = require('../src/js/common/time.js');

describe('timeZoneTools', function() {
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('should properly format the UTC offset', function() {
    var tests = [
      {values: {hours: 0, minutes: 0}, expected: "+00:00"},
      {values: {hours: 10, minutes: 1}, expected: "+10:01"},
      {values: {hours: 1, minutes: 1}, expected: "+01:01"},
      {values: {hours: -1, minutes: 1}, expected: "-01:01"},
    ];
    for (var i in tests) {
      var t = tests[i];
      expect(TimeTools.formatUTCOffset(t.values.hours, t.values.minutes)).toEqual(t.expected);
    }
  });

  it('should properly pick the right timezone from offset', function() {
    var tests = [
      {offset: 0, expected: "Europe/London"},
      {offset: -(4*3600 + 0*60), expected: "America/New_York"},
      {offset: (3*3600 + 0*60), expected: "Europe/Moscow"},
      {offset: (4*3600 + 30*60), expected: "Asia/Kabul"},
      {offset: (0*3600 + 30*60), expected: "Chatham Islands/New Zealand"},
      {offset: (24*3600 + 30*60), expected: "Chatham Islands/New Zealand"},
    ];
    for (var i in tests) {
      var t = tests[i];
      expect(TimeTools.pickTimeZoneFromOffset(t.offset).name).toEqual(t.expected);
    }
  });
});

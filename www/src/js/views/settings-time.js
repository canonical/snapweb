var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

var _ = require('lodash');
var moment = require('moment');

function formatUTCOffset(offset_hours, offset_minutes) {
  return ((offset_hours >= 0) ? "+" : "-") +
    ((offset_hours < 10) ? ("0" + Math.abs(offset_hours).toString()) : offset_hours) +
    ":" +
    ((offset_minutes < 10) ? ("0" + offset_minutes.toString()) : offset_minutes);
};

var TimeZones = [
  {name: "Chatham Islands/New Zealand", value:"Pacific/Chatham", offset: formatUTCOffset(12,45)},
  {name: "Samoa and Christmas Island/Kiribati", value:"Pacific/Kiritimati", offset: formatUTCOffset(14,0)},
  {name: "Pacific/Auckland", value: "New Zealand/Auckland", offset: formatUTCOffset(12,0)},
  {name: "Pacific/Fiji", value: "Fiji", offset: formatUTCOffset(12,0)},
  {name: "Australia/Melbourne", value: "Australia/Sydney, Melbourne", offset: formatUTCOffset(10,0)},
  {name: "Australia/Brisbane", value: "Australia/Brisbane", offset: formatUTCOffset(10,0)},
  {name: "Australia/Adelaide", value: "Australia/Adelaide, Darwin", offset: formatUTCOffset(9,30)},
  {name: "Asia/Tokyo", value: "Japan/Tokyo", offset: formatUTCOffset(9,0)},
  {name: "Asia/Pyongyang", value: "North Korea/Pyongyang", offset: formatUTCOffset(8,30)},
  {name: "Australia/Perth", value: "Australia/Perth", offset: formatUTCOffset(8,0)},
  {name: "Asia/Shanghai", value: "China/Beijing Time", offset: formatUTCOffset(8,0)},
  {name: "Asia/Jakarta", value: "Indonesia/Jakarta", offset: formatUTCOffset(7,0)},
  {name: "Indian/Cocos", value: "Cocos Islands", offset: formatUTCOffset(7,30)},
  {name: "Asia/Dhaka", value: "Bangladesh/Dhaka", offset: formatUTCOffset(6,0)},
  {name: "Asia/Kathmandu", value: "Nepal/Kathmandu", offset: formatUTCOffset(5,45)},
  {name: "Asia/Kolkata", value: "India", offset: formatUTCOffset(5,30)},
  {name: "Asia/Karachi", value: "Pakistan/Karachi", offset: formatUTCOffset(5,0)},
  {name: "Asia/Kabul", value: "Afghanistan/Kabul", offset: formatUTCOffset(4,30)},
  {name: "Asia/Dubai", value: "Dubai", offset: formatUTCOffset(4,0)},
  {name: "Asia/Tehran", value: "Iran/Tehran", offset: formatUTCOffset(3,30)},
  {name: "Europe/Moscow", value: "Russia/Moscow", offset: formatUTCOffset(3,0)},
  {name: "Africa/Cairo", value: "Egypt/Cairo", offset: formatUTCOffset(2,0)},
  {name: "Europe/Brussels", value: "Belgium/Brussels", offset: formatUTCOffset(1,0)},
  {name: "Europe/London", value: "United Kingdom/London", offset: formatUTCOffset(0,0)},
  {name: "UTC", value: "UTC", offset: formatUTCOffset(0,0)},
  {name: "Atlantic/Cape_Verde", value: "Cabo Verde/Praia", offset: formatUTCOffset(-1,0)},
  {name: "America/St_Johns", value: "Canada/St. John's", offset: formatUTCOffset(-2,30)},
  {name: "America/Buenos_Aires", value: "Argentina/Buenos Aires", offset: formatUTCOffset(-3,0)},
  {name: "America/New_York", value: "America/New York", offset: formatUTCOffset(-4,0)},
  {name: "America/Chicago", value: "America/Chicago", offset: formatUTCOffset(-5,0)},
  {name: "America/Mexico_City", value: "Mexico/Mexico City", offset: formatUTCOffset(-6,0)},
  {name: "America/Los_Angeles", value: "America/Los Angeles", offset: formatUTCOffset(-7,0)},
  {name: "America/Anchorage", value: "America/Anchorage", offset: formatUTCOffset(-8,0)},
  {name: "Pacific/Marquesas", value: "Marquesas Islands", offset: formatUTCOffset(-9,30)},
  {name: "Pacific/Honolulu", value: "United States/Honolulu", offset: formatUTCOffset(-10,0)},
  {name: "US/Samoa", value: "American Samoa", offset: formatUTCOffset(-10,0)},
];

function pickTimeZoneFromOffset(offset) {
  function clamp(value, min, max) {
    return (value > max ? max : (value < min ? min : value))
  }

  var sign = Math.sign || (function(v) { return v < 0 ? -1 : 1; });
  var offset_hours = sign(offset) * clamp(Math.floor(Math.abs(offset) / 3600), 0, 24);
  var offset_minutes = clamp(Math.floor((Math.abs(offset) - Math.abs(offset_hours) * 3600) / 60), 0, 59);

  var offset_descr = formatUTCOffset(offset_hours, offset_minutes);

  var candidateTZ = TimeZones.filter(function(tz) {
    return tz.offset === offset_descr;
  });

  var timezone = TimeZones[0];
  if (candidateTZ.length > 0) {
    // Pick the first one
    timezone = candidateTZ[0];
  }

  return timezone
}

module.exports = React.createBackboneClass({

  timeSourceChanged: function(event) {
    var model = this.props.model;
    if (event.target.id == 'automatic-time-source') {
      // Reset NTP
      model.save({'ntp': true, 'ntpServer': ''}, {patch: true});
    } else if (event.target.id == 'custom-time-source') {
      model.save({'ntp': true}, {patch: true});
    } else {
      model.save({'ntp': false}, {patch: true});
    }
    model.set('timeSource', event.target.id);
  },

  dateChanged: function(event) {
    var model = this.props.model;
    var dateTime = moment(model.get('dateTime')).utcOffset(model.get('offset') / 60);
    var newDate = _.map(event.target.value.split('-'),
                        function(v) { return parseInt(v); });

    dateTime.year(newDate[0]);
    dateTime.month(newDate[1] - 1);
    dateTime.date(newDate[2]);

    model.save({'dateTime': dateTime.unix()}, {patch: true});
  },

  timeChanged: function(event) {
    var model = this.props.model;
    var dateTime = moment(model.get('dateTime')).utcOffset(model.get('offset') / 60);
    var newTime = _.map(event.target.value.split(':'),
                        function(v) { return parseInt(v); });

    dateTime.hour(newTime[0]);
    dateTime.minute(newTime[1]);
    dateTime.second(newTime[3]);

    model.save({'dateTime': dateTime.unix()}, {patch: true});
  },

  timezoneSelectChanged: function(event) { var selected = event.target.value;
    var model = this.props.model;
    if (selected != model.get('timezone')) {
      model.save({'timezone': selected}, {patch: true});
    }
  },

  ntpServerNameChanged: function(event) {
    var ntpServerName = event.target.value;
    if (ntpServerName !== this.props.model.get('ntpServer')) {
      this.props.model.save({'ntpServer': ntpServerName}, {patch: true});
    }
  },

  render: function() {
    var model = this.props.model;

    var timeSource = model.get('timeSource') || null;
    if (timeSource == null) {
      if (model.get('ntp')) {
        if (model.get('ntpServer')) {
          timeSource = 'custom-time-source';
        } else {
          timeSource = 'automatic-time-source';
        }
      } else {
        timeSource = 'manual-time-source';
      }
    }

    var dateTime = moment.unix(model.get('dateTime') || moment.unix());
    dateTime = dateTime.utcOffset((model.get('offset') / 60) || 0);

    var timezoneName = model.get('timezone');
    var candidateTZ = TimeZones.filter(function(tz) {
      return tz.name === timezoneName;
    });

    var timezone;
    if (candidateTZ.length === 0) {
      // Select timezone based on "closer to" offset heuristic
      //  rather than explicit name
      var offset = model.get('offset') || 0;
      timezone = pickTimeZoneFromOffset(offset);
    } else {
      timezone = candidateTZ[0];
    }

    function formatTimeZoneSelectorValue(tz) {
      return  "(UTC" + tz.offset + ") " + tz.value;
    }

    return (
      <div>
        <div className="row">
          <h2>Date and time</h2>
        </div>
        <div className="row">
          <input
            type="radio"
            id="automatic-time-source"
            name="ntp-server"
            checked={timeSource == 'automatic-time-source'}
            onChange={this.timeSourceChanged} />
          <label htmlFor="automatic-ntp-radio">
            <strong>Use automatic NTP server configuration</strong>
          </label>

          <input
            type="radio"
            id="custom-time-source"
            name="ntp-server"
            checked={timeSource == 'custom-time-source'}
            onChange={this.timeSourceChanged} />
          <label htmlFor="custom-ntp-radio">
            <strong>Use custom NTP server</strong>
          </label>

          <input
            type="radio"
            id="manual-time-source"
            name="ntp-server"
            checked={timeSource == 'manual-time-source'}
            onChange={this.timeSourceChanged} />
          <label htmlFor="manial-ntp-radio">
            <strong>Set date and time manually</strong>
          </label>
        </div>

        <div className="row u-vertically-center">
          <div className="col-3"><strong>Date</strong></div>
          <div className="col-5">
            <input
              type="date"
              id="date-picker"
              value={dateTime.format('YYYY-MM-DD')}
              onChange={this.dateChanged}
              disabled={timeSource != 'manual-time-source'} />
          </div>
        </div>

        <div className="row u-vertically-center">
          <div className="col-3"><strong>Time</strong></div>
          <div className="col-5">
            <input
              type="time"
              id="time-picker"
              value={dateTime.format('HH:mm:SS')}
              onChange={this.timeChanged}
              disabled={timeSource != 'manual-time-source'} />
          </div>
        </div>

        <div className="row u-vertically-center">
          <label className="col-3 u-float--left" htmlFor="time-zone-select">
            <strong>Timezone</strong>
          </label>

          <select
            className="col-5 u-float--right"
            id="time-zone-select"
            value={timezone.name}
            onChange={this.timezoneSelectChanged}>

            {TimeZones.map(function(tz) {
              return (
                  <option key={tz.name} value={tz.name}> {formatTimeZoneSelectorValue(tz)} </option>
              );
            })}

          </select>
      </div>

        <div className="row u-vertically-center">
          <label className="col-3 u-float--left" htmlFor="ntp-server-name">
            <strong>Custom NTP server</strong>
          </label>
          <input
            className="col-5 u-float--right"
            type="text"
            placeholder="NTP server domain"
            id="ntp-server-name"
            value={model.get('ntpServer')}
            onChange={this.ntpServerNameChanged}
            disabled={timeSource != 'custom-time-source'} />
        </div>
      </div>
    );
  }
});

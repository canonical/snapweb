
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var React = require('react');
var ReactBackbone = require('react.backbone');

var _ = require('lodash');
var moment = require('moment');

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
            value={model.get('timezone')}
            onChange={this.timezoneSelectChanged}>
            <option value="Pacific/Kiritimati">(UTC+14:00) Samoa and Christmas Island/Kiribati</option>
            <option value="Pacific/Chatham">(UTC+12:45) Chatham Islands/New Zealand</option>
            <option value="Pacific/Auckland">(UTC+12:00) New Zealand/Auckland</option>
            <option value="Pacific/Fiji">(UTC+12:00) Fiji</option>
            <option value="Australia/Melbourne">(UTC+10:00) Australia/Sydney, Melbourne</option>
            <option value="Australia/Brisbane">(UTC+10:00) Australia/Brisbane</option>
            <option value="Australia/Adelaide">(UTC+09:30) Australia/Adelaide, Darwin</option>
            <option value="Asia/Tokyo">(UTC+09:00) Japan/Tokyo</option>
            <option value="Asia/Pyongyang">(UTC+08:30) North Korea/Pyongyang</option>
            <option value="Australia/Perth">(UTC+08:00) Australia/Perth</option>
            <option value="Asia/Shanghai">(UTC+08:00) China/Beijing Time</option>
            <option value="Asia/Jakarta">(UTC+07:00) Indonesia/Jakarta</option>
            <option value="Indian/Cocos">(UTC+06:30) Cocos Islands</option>
            <option value="Asia/Dhaka">(UTC+06:00) Bangladesh/Dhaka</option>
            <option value="Asia/Kathmandu">(UTC+05:45) Nepal/Kathmandu</option>
            <option value="Asia/Kolkata">(UTC+05:30) India</option>
            <option value="Asia/Karachi">(UTC+05:00) Pakistan/Karachi </option>
            <option value="Asia/Kabul">(UTC+04:30) Afghanistan/Kabul</option>
            <option value="Asia/Dubai">(UTC+04:00) Dubai</option>
            <option value="Asia/Tehran">(UTC+03:30) Iran/Tehran</option>
            <option value="Europe/Moscow">(UTC+03:00) Russia/Moscow</option>
            <option value="Africa/Cairo">(UTC+02:00) Egypt/Cairo</option>
            <option value="Europe/Brussels">(UTC+01:00) Belgium/Brussels</option>
            <option value="Europe/London">(UTC+00:00) United Kingdom/London</option>
            <option value="UTC">(UTC+00:00) UTC</option>
            <option value="Atlantic/Cape_Verde">(UTC-01:00) Cabo Verde/Praia</option>
            <option value="America/St_Johns">(UTC-02:30) Canada/St. John's</option>
            <option value="Ameraica/Buenos_Aires">(UTC-03:00) Argentina/Buenos Aires</option>
            <option value="America/New_York">(UTC-04:00) America/New York</option>
            <option value="America/Chicago">(UTC-05:00) America/Chicago</option>
            <option value="America/Mexico_City">(UTC-06:00) Mexico/Mexico City</option>
            <option value="America/Los_Angeles">(UTC-07:00) America/Los Angeles</option>
            <option value="America/Anchorage">(UTC-08:00) America/Anchorage</option>
            <option value="Pacific/Marquesas">(UTC-09:30) Marquesas Islands</option>
            <option value="Pacific/Honolulu">(UTC-10:00) United States/Honolulu</option>
            <option value="US/Samoa">(UTC-11:00) American Samoa</option>
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

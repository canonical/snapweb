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
    var dateTime = moment.unix(model.get('dateTime'));
    var newDate = _.map(event.target.value.split('-'), 
                        function(v) { return parseInt(v); });

    dateTime.year(newDate[0]);
    dateTime.month(newDate[1] - 1);
    dateTime.date(newDate[2]);

    model.save({'dateTime': dateTime.unix()}, {patch: true});
  },

  timeChanged: function(event) {
    var model = this.props.model; 
    var dateTime = moment.unix(model.get('dateTime'));
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

    var dateTime = moment.unix(model.get('dateTime') || moment().unix());

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
            <option value="Pacific/Midway">Midway Island, Samoa</option>
            <option value="Pacific/Honolulu">Hawaii</option>
            <option value="America/Anchorage">Alaska (most areas)</option>
            <option value="American/Tijuana">Pacific Time US - Baja California</option>
            <option value="America/Phoenix">MST - Arizona (except Navajo)</option>
            <option value="America/Chihuahua">Mountain Time - Chihuahua (most areas)</option>
            <option value="America/Chicago">America Central (most area)</option>
            <option value="America/Mexico_City">Mexico City</option>
            <option value="America/Bogota">Bogota</option>
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Indiana/Indianapolis">Indiana (East)</option>
            <option value="America/Santiago">Santiago</option>
            <option value="America/St_Johns">Newfoundland; Labrador (southeast)</option>
            <option value="America/Argentina/Buenos_Aires">Buenos Aires (BA, CF)</option>
            <option value="American/Godthab">Greenland (most areas)</option>
            <option value="Atlantic/Cape_Verde">Cape Verde Is.</option>
            <option value="Atlantic/Azores">Azores</option>
            <option value="Africa/Casablanca">Casablanca</option>
            <option value="Europe/Dublin">Dublin</option>
            <option value="Europe/Amsterdam">Amsterdam</option>
            <option value="Europe/Budapest">Budapest</option>
            <option value="Europe/Brussels">Brussels</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Europe/Madrid">Spain (mainland)</option>
            <option value="Europe/Warsaw">Warsaw</option>
            <option value="Europe/Athens">Athens</option>
            <option value="Asia/Beirut">Beirut</option>
            <option value="Africa/Johannesburg">Johannesburg</option>
            <option value="Europe/Helsinki">Helsinki</option>
            <option value="Europe/Minsk">Minsk</option>
            <option value="Africa/Windhoek">Windhoek</option>
            <option value="Asia/Kuwait">Kuwait</option>
            <option value="Europe/Moscow">MSK+00 - Moscow area</option>
            <option value="Africa/Nairobi">Nairobi</option>
            <option value="Asia/Baku">Baku</option>
            <option value="Asia/Yerevan">Yerevan</option>
            <option value="Asia/Kabul">Kabul</option>
            <option value="Asia/Yekaterinburg">MSK+02 - Urals</option>
            <option value="Asia/Karachi">Karachi</option>
            <option value="Asia/Kathmandu">Kathmandu</option>
            <option value="Asia/Dhaka">Dhaka</option>
            <option value="Asia/Bangkok">Bangkok</option>
            <option value="Asia/Shanghai">Beijing Time</option>
            <option value="Asia/Kuala_Lumpur">Malaysia (peninsula)</option>
            <option value="Asia/Irkutsk">MSK+05 - Irkutsk, Buryatia</option>
            <option value="Australia/Perth">Western Australia (most areas)</option>
            <option value="Asia/Taipei">Taipei</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Seoul">Seoul</option>
            <option value="Australia/Brisbane">Queensland (most areas)</option>
            <option value="Australia/Sydney">New South Wales (most areas)</option>
            <option value="Pacific/Guam">Guam</option>
            <option value="Asia/Vladivostok">MSK+07 - Amur River</option>
            <option value="Asia/Magadan">Magadan</option>
            <option value="Pacific/Auckland">New Zealand (most areas)</option>
            <option value="Pacific/Fiji">Fiji</option>
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

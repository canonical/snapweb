var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-time.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__time',

  events: {
    'change #date-picker': 'dateChanged',
    'change #time-picker': 'timeChanged',
    'change input[type=radio]': 'ntpServerTypeChanged',
    'change #ntp-server-name': 'ntpServerNameChanged',
    'change #time-zone-select': 'timezoneSelectChanged',
  },

  initialize: function() {
  },

  template: function(model) {
    return template(model);
  },

  dateChanged: function() {
    var datePicker = this.$('#date-picker');
    this.model.save({'date': datePicker.val()}, {patch: true});
  },

  timeChanged: function() {
    var timePicker = this.$('#time-picker');
    this.model.save({'time': timePicker.val()}, {patch: true});
  },

  ntpServerTypeChanged: function(event) {
    if (event.currentTarget.id === "automatic-ntp-radio") {
      this.$('#ntp-server-name').prop('disabled', true);
      this.$('#ntp-server-name').val('');
      this.ntpServerNameChanged();
    } else {
      this.$('#ntp-server-name').prop('disabled', false);
    } 
  },

  ntpServerNameChanged: function() {
    var ntpServerName = this.$('#ntp-server-name').val();
    if (ntpServerName !== this.model.get('ntpServer')) {
      this.model.save({'ntpServer': ntpServerName}, {patch: true});
    }
  },

  timezoneSelectChanged: function() {
    var selected = this.$('#time-zone-select').val();
    if (selected != this.model.get('timezone')) {
      this.model.save({'timezone': selected}, {patch: true});
    }
  },

  onRender: function() {
    var haveServer = this.model.get('ntpServer') || false;

    this.$('#automatic-ntp-radio').prop('checked', !haveServer);
    this.$('#manual-ntp-radio').prop('checked', haveServer);
    this.$('#ntp-server-name').prop('disabled', !haveServer)
    this.$('#date-picker').prop('disabled', true);
    this.$('#time-picker').prop('disabled', true);

    var dropDown = this.$('#time-zone-select');
    dropDown.append([
          // jscs:disable maximumLineLength
          '<option value="Pacific/Midway">Midway Island, Samoa</option>',
          '<option value="Pacific/Honolulu">Hawaii</option>',
          '<option value="America/Anchorage">Alaska (most areas)</option>',
          '<option value="American/Tijuana">Pacific Time US - Baja California</option>',
          '<option value="America/Phoenix">MST - Arizona (except Navajo)</option>',
          '<option value="America/Chihuahua">Mountain Time - Chihuahua (most areas)</option',
          '<option value="America/Chicago">America Central (most area)</option>',
          '<option value="America/Mexico_City">Mexico City</option>',
          '<option value="America/Bogota">Bogota</option>',
          '<option value="America/New_York">Eastern Time (US & Canada)</option>',
          '<option value="America/Indiana/Indianapolis">Indiana (East)</option>',
          '<option value="America/Santiago">Santiago</option>',
          '<option value="America/St_Johns">Newfoundland; Labrador (southeast)</option>',
          '<option value="America/Argentina/Buenos_Aires">Buenos Aires (BA, CF)</option>',
          '<option value="American/Godthab">Greenland (most areas)</option>',
          '<option value="Atlantic/Cape_Verde">Cape Verde Is.</option>',
          '<option value="Atlantic/Azores">Azores</option>',
          '<option value="Africa/Casablanca">Casablanca</option>',
          '<option value="Europe/Dublin">Dublin/option>',
          '<option value="Europe/Amsterdam">Amsterdam</option>',
          '<option value="Europe/Budapest">Budapest</option>',
          '<option value="Europe/Brussels">Brussels</option>',
          '<option value="Europe/Paris">Paris</option>',
          '<option value="Europe/Madrid">Spain (mainland)</option>',
          '<option value="Europe/Warsaw">Warsaw</option>',
          '<option value="Europe/Athens">Athens</option>',
          '<option value="Asia/Beirut">Beirut</option>',
          '<option value="Africa/Johannesburg">Johannesburg</option>',
          '<option value="Europe/Helsinki">Helsinki</option>',
          '<option value="Europe/Minsk">Minsk</option>',
          '<option value="Africa/Windhoek">Windhoek</option>',
          '<option value="Asia/Kuwait">Kuwait</option>',
          '<option value="Europe/Moscow">MSK+00 - Moscow area</option>',
          '<option value="Africa/Nairobi">Nairobi</option>',
          '<option value="Asia/Baku">Baku</option>',
          '<option value="Asia/Yerevan">Yerevan</option>',
          '<option value="Asia/Kabul">Kabul</option>',
          '<option value="Asia/Yekaterinburg">MSK+02 - Urals</option>',
          '<option value="Asia/Karachi">Karachi</option>',
          '<option value="Asia/Kathmandu">Kathmandu</option>',
          '<option value="Asia/Dhaka">Dhaka</option>',
          '<option value="Asia/Bangkok">Bangkok</option>',
          '<option value="Asia/Shanghai">Beijing Time</option>',
          '<option value="Asia/Kuala_Lumpur">Malaysia (peninsula)</option>',
          '<option value="Asia/Irkutsk">MSK+05 - Irkutsk, Buryatia</option>',
          '<option value="Australia/Perth">Western Australia (most areas)</option>',
          '<option value="Asia/Taipei">Taipei</option>',
          '<option value="Asia/Tokyo">Tokyo</option>',
          '<option value="Asia/Seoul">Seoul</option>',
          '<option value="Australia/Brisbane">Queensland (most areas)</option>',
          '<option value="Australia/Sydney">New South Wales (most areas)</option>',
          '<option value="Pacific/Guam">Guam</option>',
          '<option value="Asia/Vladivostok">MSK+07 - Amur River</option>',
          '<option value="Asia/Magadan">Magadan</option>',
          '<option value="Pacific/Auckland">New Zealand (most areas)</option>',
          '<option value="Pacific/Fiji">Fiji</option>',
        ].join('\n'));
    dropDown.prop('value', this.model.get('timezone'));
  }
});

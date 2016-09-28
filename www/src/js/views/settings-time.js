var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/settings-time.hbs');

module.exports = Backbone.Marionette.ItemView.extend({
  className: 'b-settings__time',

  events: {
    'change #date-picker': 'dateChanged',
    'change #time-picker': 'timeChanged',
    'change #ntp-active-checkbox': 'ntpActiveCheckboxChanged',
    'change #ntp-server-name': 'ntpServerNameChanged',
    'change #time-zone-select': 'timezoneSelectChanged'
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

  ntpActiveCheckboxChanged: function() {
    var checked = this.$('#ntp-active-checkbox').prop('checked');

    this.$('#ntp-server-name').prop('disabled', !checked)
    this.$('#date-picker').prop('disabled', checked);
    this.$('#time-picker').prop('disabled', checked);
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
    var haveServer = this.model.get('ntpServer') !== "";

    this.$('#ntp-active-checkbox').prop('checked', haveServer);
    this.$('#ntp-server-name').prop('disabled', !haveServer)
    this.$('#date-picker').prop('disabled', haveServer);
    this.$('#time-picker').prop('disabled', haveServer);

    var dropDown = this.$('#time-zone-select');
    dropDown.append([
          '<option value="-12">(UTC-12:00) International Date Line West</option>',
          '<option value="-11">(UTC-11:00) Midway Island, Samoa</option>',
          '<option value="-10">(UTC-10:00) Hawaii</option>',
          '<option value="-9">(UTC-09:00) Alaska</option>',
          '<option value="-8">(UTC-08:00) Pacific Time (US & Canada)</option>',
          '<option value="-8">(UTC-08:00) Tijuana, Baja California</option>',
          '<option value="-7">(UTC-07:00) Arizona</option>',
          '<option value="-7">(UTC-07:00) Chihuahua, La Paz, Mazatlan</option>',
          '<option value="-7">(UTC-07:00) Mountain Time (US & Canada)</option>',
          '<option value="-6">(UTC-06:00) Central America</option>',
          '<option value="-6">(UTC-06:00) Central Time (US & Canada)</option>',
          '<option value="-6">(UTC-06:00) Guadalajara, Mexico City, Monterrey</option>',
          '<option value="-6">(UTC-06:00) Saskatchewan</option>',
          '<option value="-5">(UTC-05:00) Bogota, Lima, Quito, Rio Branco</option>',
          '<option value="-5">(UTC-05:00) Eastern Time (US & Canada)</option>',
          '<option value="-5">(UTC-05:00) Indiana (East)</option>',
          '<option value="-4">(UTC-04:00) Atlantic Time (Canada)</option>',
          '<option value="-4">(UTC-04:00) Caracas, La Paz</option>',
          '<option value="-4">(UTC-04:00) Manaus</option>',
          '<option value="-4">(UTC-04:00) Santiago</option>',
          '<option value="-3.5">(UTC-03:30) Newfoundland</option>',
          '<option value="-3">(UTC-03:00) Brasilia</option>',
          '<option value="-3">(UTC-03:00) Buenos Aires, Georgetown</option>',
          '<option value="-3">(UTC-03:00) Greenland</option>',
          '<option value="-3">(UTC-03:00) Montevideo</option>',
          '<option value="-2">(UTC-02:00) Mid-Atlantic</option>',
          '<option value="-1">(UTC-01:00) Cape Verde Is.</option>',
          '<option value="-1">(UTC-01:00) Azores</option>',
          '<option value="0">(UTC+00:00) Casablanca, Monrovia, Reykjavik</option>',
          '<option value="0">(UTC+00:00) Dublin, Edinburgh, Lisbon, London</option>',
          '<option value="1">(UTC+01:00) Amsterdam, Berlin, Rome, Stockholm, Vienna</option>',
          '<option value="1">(UTC+01:00) Belgrade, Budapest, Ljubljana, Prague</option>',
          '<option value="1">(UTC+01:00) Brussels, Copenhagen, Madrid, Paris</option>',
          '<option value="1">(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb</option>',
          '<option value="1">(UTC+01:00) West Central Africa</option>',
          '<option value="2">(UTC+02:00) Amman</option>',
          '<option value="2">(UTC+02:00) Athens, Bucharest, Istanbul</option>',
          '<option value="2">(UTC+02:00) Beirut</option>',
          '<option value="2">(UTC+02:00) Cairo</option>',
          '<option value="2">(UTC+02:00) Harare, Pretoria</option>',
          '<option value="2">(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius</option>',
          '<option value="2">(UTC+02:00) Jerusalem</option>',
          '<option value="2">(UTC+02:00) Minsk</option>',
          '<option value="2">(UTC+02:00) Windhoek</option>',
          '<option value="3">(UTC+03:00) Kuwait, Riyadh, Baghdad</option>',
          '<option value="3">(UTC+03:00) Moscow, St. Petersburg, Volgograd</option>',
          '<option value="3">(UTC+03:00) Nairobi</option>',
          '<option value="3">(UTC+03:00) Tbilisi</option>',
          '<option value="3.5">(UTC+03:30) Tehran</option>',
          '<option value="4">(UTC+04:00) Abu Dhabi, Muscat</option>',
          '<option value="4">(UTC+04:00) Baku</option>',
          '<option value="4">(UTC+04:00) Yerevan</option>',
          '<option value="4.5">(UTC+04:30) Kabul</option>',
          '<option value="5">(UTC+05:00) Yekaterinburg</option>',
          '<option value="5">(UTC+05:00) Islamabad, Karachi, Tashkent</option>',
          '<option value="5.5">(UTC+05:30) Sri Jayawardenapura</option>',
          '<option value="5.5">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>',
          '<option value="5.75">(UTC+05:45) Kathmandu</option>',
          '<option value="6">(UTC+06:00) Almaty, Novosibirsk</option>',
          '<option value="6">(UTC+06:00) Astana, Dhaka</option>',
          '<option value="6.5">(UTC+06:30) Rangoon</option>',
          '<option value="7">(UTC+07:00) Bangkok, Hanoi, Jakarta</option>',
          '<option value="7">(UTC+07:00) Krasnoyarsk</option>',
          '<option value="8">(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>',
          '<option value="8">(UTC+08:00) Kuala Lumpur, Singapore</option>',
          '<option value="8">(UTC+08:00) Irkutsk, Ulaan Bataar</option>',
          '<option value="8">(UTC+08:00) Perth</option>',
          '<option value="8">(UTC+08:00) Taipei</option>',
          '<option value="9">(UTC+09:00) Osaka, Sapporo, Tokyo</option>',
          '<option value="9">(UTC+09:00) Seoul</option>',
          '<option value="9">(UTC+09:00) Yakutsk</option>',
          '<option value="9.5">(UTC+09:30) Adelaide</option>',
          '<option value="9.5">(UTC+09:30) Darwin</option>',
          '<option value="10">(UTC+10:00) Brisbane</option>',
          '<option value="10">(UTC+10:00) Canberra, Melbourne, Sydney</option>',
          '<option value="10">(UTC+10:00) Hobart</option>',
          '<option value="10">(UTC+10:00) Guam, Port Moresby</option>',
          '<option value="10">(UTC+10:00) Vladivostok</option>',
          '<option value="11">(UTC+11:00) Magadan, Solomon Is., New Caledonia</option>',
          '<option value="12">(UTC+12:00) Auckland, Wellington</option>',
          '<option value="12">(UTC+12:00) Fiji, Kamchatka, Marshall Is.</option>',
          '<option value="13">(UTC+13:00) Nuku\'alofa</option>',
        ].join('\n'));
    dropDown.prop('value', this.model.get('timezone'));
  }
});

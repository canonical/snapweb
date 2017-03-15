function formatUTCOffset(offset_hours, offset_minutes) {
  function pad(v) {
    return ((v < 10) ? ("0" + v.toString()) : v);
  }
  var om = Math.abs(offset_minutes);
  return ((offset_hours >= 0) ? "+" : "-") + pad(Math.abs(offset_hours)) + ":" + pad(om);
};

export const TimeZones = [
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

  // Needed for PhantomJS
  var signFunc = Math.sign || (function(v) { return v < 0 ? -1 : 1; });

  var abs_offset = Math.abs(offset);

  var offset_hours = signFunc(offset) * clamp(Math.floor(abs_offset / 3600), 0, 23);
  var offset_minutes = clamp(Math.floor((abs_offset - Math.abs(offset_hours) * 3600) / 60), 0, 59);

  var offset_descr = formatUTCOffset(offset_hours, offset_minutes);

  var candidateTZ = TimeZones.filter(function(tz) {
    return tz.offset === offset_descr;
  });

  // TODO check default
  var timezone = TimeZones[0];
  if (candidateTZ.length > 0) {
    // Pick the first one
    timezone = candidateTZ[0];
  }

  return timezone
}

export {
  pickTimeZoneFromOffset,
  formatUTCOffset
}

var api = function(endpoint) {
  return '/api/v2/' + endpoint;
}

module.exports = {
  PACKAGES: api('packages/'),
  TIME_INFO: api('time-info'),
  CREATE_USER: api('create-user'),
  SECTIONS: api('sections'),
  DEVICE_INFO: api('device-info'),
  DEVICE_ACTION: api('device-action'),
  USER_PROFILE: api('user-profile'),
  FILTERED_SNAPS: [
    'snapweb',
    'ubuntu-core'
  ],
  NON_INSTALLABLE_IDS: [
    'snapweb',
    'ubuntu-core'
  ],
  NON_INSTALLABLE_TYPES: [
    'gadget'
  ],
  NON_REMOVABLE_SNAP_TYPES: [
    'gadget',
    'os',
    'kernel'
  ],
  INSTALL_STATE: {
    INSTALLED: 'installed',
    INSTALLING: 'installing',
    REMOVED: 'uninstalled',
    REMOVING: 'uninstalling',
    ACTIVE: 'active',
    PRICED: 'priced'
  },
  INSTALL_POLL_WAIT: 16, // milliseconds
  SNAPWEB_AUTH_TOKEN_COOKIE_NAME: "SnapwebLocalToken",
  SNAPWEB_AUTH_MACAROON_COOKIE_NAME: "SnapwebAuthMacaroon",
};

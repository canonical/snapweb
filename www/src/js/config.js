module.exports = {
  PACKAGES: '/api/v2/packages/',
  TIME_INFO: '/api/v2/time-info',
  CREATE_USER: '/api/v2/create-user',
  DEVICE_INFO: '/api/v2/device-info',
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
  INSTALL_STATE: {
    INSTALLED: 'installed',
    INSTALLING: 'installing',
    REMOVED: 'uninstalled',
    REMOVING: 'uninstalling'
  },
  INSTALL_POLL_WAIT: 16 // milliseconds
};

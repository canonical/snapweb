module.exports = {
  PACKAGES: '/api/v2/packages/',
  TIME_INFO: '/api/v2/time-info',
  CREATE_USER: '/api/v2/create-user',
  SECTIONS: '/api/v2/sections',
  DEVICE_INFO: '/api/v2/device-info',
  DEVICE_ACTION: '/api/v2/device-action',
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
  INSTALL_POLL_WAIT: 16 // milliseconds
};

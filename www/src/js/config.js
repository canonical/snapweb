module.exports = {
  PACKAGES: '/api/v2/packages/',
  SETTINGS: '/api/v2/packages/ubuntu-core',
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

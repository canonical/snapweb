// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/* global YUI_config */
YUI_config.groups = {
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  core: {
    combine: false,
    comboBase: '/yui3?',
    root: 'dist/js/core/',
    base: '/dist/js/core/',
    modules: {
      'core-settings': {
        path: 'settings/index.js',
        requires: [
          'core-settings-views',
        ]
      },
      'core-settings-views': {
        path: 'settings/views/index.js',
        requires: [
        'view',
        'template',
        't-core-settings-tmpl-form'
        ]
      },
      't-core-settings-tmpl-list': {
        path: 'settings/tmpl/list.js',
        requires: ['template']
      },
      't-core-settings-tmpl-form': {
        path: 'settings/tmpl/form.js',
        requires: ['template']
      }
    }
  },
  vendor: {
    combine: false,
    base: 'https://snappy.local:3001/dist/js/vendor/',
    modules: {
      'vendor-launcher': {
        path: 'launcher.js',
        requires: ['node']
      },
      'vendor-store': {
        path: 'store.js',
        requires: ['node']
      }
    }
  }
};

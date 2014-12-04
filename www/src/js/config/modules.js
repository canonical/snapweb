// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/* global YUI_config */
YUI_config.groups = {
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  core: {
    combine: false,
    comboBase: '/yui3?',
    root: 'public/js/core/',
    base: '/public/js/core/',
    modules: {
      // settings
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
      },
      // manage
      'core-manage': {
        path: 'manage/index.js',
        requires: [
          'core-manage-views',
        ]
      },
      'core-manage-views': {
        path: 'manage/views/index.js',
        requires: [
        'view',
        'io-base',
        'core-manage-view-snaplist',
        'core-manage-view-snap'
        ]
      },
      'core-manage-view-snaplist': {
        path: 'manage/views/_list.js',
        requires: [
        'view',
        'template',
        't-core-manage-tmpl-list'
        ]
      },
      'core-manage-view-snap': {
        path: 'manage/views/_snap.js',
        requires: [
        'view',
        'template',
        't-core-manage-tmpl-snap'
        ]
      },
      't-core-manage-tmpl-list': {
        path: 'manage/tmpl/list.js',
        requires: ['template']
      },
      't-core-manage-tmpl-snap': {
        path: 'manage/tmpl/snap.js',
        requires: ['template']
      },
      // store
      'core-store': {
        path: 'store/index.js',
        requires: [
          'core-store-views',
        ]
      },
      'core-store-views': {
        path: 'store/views/index.js',
        requires: [
        'view',
        'io-base',
        'core-store-view-list',
        'core-store-view-nav'
        ]
      },
      'core-store-view-list': {
        path: 'store/views/_list.js',
        requires: [
        'view',
        'template',
        't-core-store-tmpl-list'
        ]
      },
      'core-store-view-nav': {
        path: 'store/views/_nav.js',
        requires: [
        'view',
        'template',
        't-core-store-tmpl-nav'
        ]
      },
      't-core-store-tmpl-list': {
        path: 'store/tmpl/list.js',
        requires: ['template']
      },
      't-core-store-tmpl-nav': {
        path: 'store/tmpl/nav.js',
        requires: ['template']
      },
    }
  },
  vendor: {
    combine: false,
    root: 'public/js/core/',
    base: '/public/js/core/',
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

/*
 * Copyright (C) 2016 Canonical Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

module.exports = {
  PACKAGES: '/api/v2/packages/',
  TIME_INFO: '/api/v2/time-info',
  BRANDING_DATA: '/api/v2/branding-data',
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

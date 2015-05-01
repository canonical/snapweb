#include <tunables/global>

###VAR###

###PROFILEATTACH### (attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>

  # Read-only for the install directory
  @{CLICK_DIR}/@{APP_PKGNAME}/                                      r,
  @{CLICK_DIR}/@{APP_PKGNAME}/@{APP_VERSION}/                       r,
  @{CLICK_DIR}/@{APP_PKGNAME}/@{APP_VERSION}/**                mrklix,

  # Writable home area
  owner @{HOMEDIRS}/apps/@{APP_PKGNAME}/@{APP_VERSION}/            rw,
  owner @{HOMEDIRS}/apps/@{APP_PKGNAME}/@{APP_VERSION}/**     mrwklix,

  # Read-only system area for other versions
  /var/lib/apps/@{APP_PKGNAME}/                                    rw,
  /var/lib/apps/@{APP_PKGNAME}/**                               mrkix,

  # Writable system area only for this version.
  /var/lib/apps/@{APP_PKGNAME}/@{APP_VERSION}/                      w,
  /var/lib/apps/@{APP_PKGNAME}/@{APP_VERSION}/**                   wl,

  # temp dirs
  /tmp/snaps/@{APP_PKGNAME}/                                        r,
  /tmp/snaps/@{APP_PKGNAME}/**                                     rk,
  /tmp/snaps/@{APP_PKGNAME}/@{APP_VERSION}/                        rw,
  /tmp/snaps/@{APP_PKGNAME}/@{APP_VERSION}/**                 mrwlkix,

  # magic script
  /bin/uname                                                      ixr,
  /usr/bin/basename                                               ixr,
  /usr/bin/realpath                                               ixr,
  /usr/bin/dirname                                                ixr,
  /bin/dash                                                       ixr,
  /bin/sed                                                        ixr,
  /bin/mkdir                                                      ixr,

  @{PROC}/sys/kernel/hostname                                       r,
  @{PROC}/sys/kernel/somaxconn                                      r,
  @{PROC}/sys/net/core/somaxconn                                    r,

  # system image
  /etc/system-image/channel.ini                                     r,
  /writable/cache/system/etc/system-image/channel.ini               r,

  # snaps
  /apps/                                                            r,
  /apps/**                                                        rwl,
  /oem/                                                             r,
  /oem/**                                                         rwl,
  /tmp/                                                             r,
  /tmp/**                                                         rwl,
  /var/lib/apps/                                                    r,
  /var/lib/apps/**                                                rwl,
  /var/lib/snappy/                                                  r,
  /var/lib/snappy/**                                              rwl,
  /var/lib/click/hooks/                                             r,
  /var/lib/click/hooks/**                                         rwl,
  /home/                                                            r,
  /home/**                                                          r,


  # snappy unpack
  /usr/bin/snappy                                                 Uxr,

  # snappy tty change
  /dev/tty                                                          r,

  # snappy requirements
  /bin/lsblk                                                      Uxr,
  /bin/mountpoint                                                 Uxr,
  /usr/bin/debsig-verify                                          Uxr,
  /usr/bin/sc-filtergen                                           Uxr,
  /usr/bin/aa-clickhook                                           Uxr,

  capability net_admin,
  capability dac_override,
}

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
  owner @{HOMEDIRS}/snaps/@{APP_PKGNAME}/@{APP_VERSION}/           rw,
  owner @{HOMEDIRS}/snaps/@{APP_PKGNAME}/@{APP_VERSION}/**    mrwklix,

  # Read-only system area for other versions
  /var/lib/snaps/@{APP_PKGNAME}/                                   rw,
  /var/lib/snaps/@{APP_PKGNAME}/**                              mrkix,

  # Writable system area only for this version.
  /var/lib/snaps/@{APP_PKGNAME}/@{APP_VERSION}/                     w,
  /var/lib/snaps/@{APP_PKGNAME}/@{APP_VERSION}/**                  wl,

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
  /snaps/                                                           r,
  /snaps/**                                                       rwl,
  /gadget/                                                          r,
  /gadget/**                                                      rwl,
  /tmp/                                                             r,
  /tmp/**                                                         rwl,
  /var/lib/snaps/                                                   r,
  /var/lib/snaps/**                                               rwl,
  /var/lib/snappy/                                                  r,
  /var/lib/snappy/**                                              rwl,
  /var/lib/click/hooks/                                             r,
  /var/lib/click/hooks/**                                         rwl,
  /home/                                                            r,
  /home/**                                                          r,


  # snappy unpack
  /usr/bin/snappy                                                 uxr,

  # snappy tty change
  /dev/tty                                                          r,

  # snappy requirements
  /bin/lsblk                                                      Uxr,
  /bin/mountpoint                                                 Uxr,
  /bin/cp                                                         Uxr,
  /usr/bin/debsig-verify                                          Uxr,
  /usr/bin/sc-filtergen                                           Uxr,
  /usr/bin/aa-clickhook                                           Uxr,
  /usr/bin/aa-profile-hook                                        Uxr,

  # snapd REST API
  /run/snapd.socket                                                rw,

  # TODO: attention needed here
  /etc/lsb-release                                                  r,
  /sbin/apparmor_parser                                           Uxr,
  /usr/bin/unsquashfs                                             Uxr,
  /usr/share/apparmor/easyprof/policygroups/**                      r,
  /usr/share/apparmor/easyprof/templates/**                         r,
  /usr/share/seccomp/policygroups/**                                r,
  /usr/share/seccomp/templates/**                                   r,
  /var/cache/apparmor/**                                            w,

  # snappy requirements for services
  /etc/dbus-1/system.d/                                             r,
  /etc/dbus-1/system.d/**                                         rwl,
  /etc/mime.types                                                   r,
  /usr/share/click/hooks/                                           r,
  /usr/share/click/hooks/**                                         r,
  /etc/systemd/system/                                              r,
  /etc/systemd/system/**                                          rwl,
  /var/lib/apparmor/clicks/                                         r,
  /var/lib/apparmor/clicks/**                                     rwl,
  /var/lib/apparmor/snappy/                                         r,
  /var/lib/apparmor/snappy/**                                     rwl,
  /bin/systemctl                                                  Uxr,

  capability net_admin,
  capability dac_override,
}

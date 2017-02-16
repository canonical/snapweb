#!/bin/bash
#
# Copyright (C) 2017 Canonical Ltd
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

set -e

if [ $(id -u) -ne 0 ] ; then
	echo "ERROR: needs to be executed as root"
	exit 1
fi

channel=candidate
if [ ! -z "$1" ] ; then
	channel=$1
fi

snap=
if [ ! -z "$2" ] ; then
	snap=$2
fi

model=pc
arch=amd64
image_name=ubuntu-core-16-embryonic.img
ubuntu_image_extra_args=

if [ ! -z "$snap" ] ; then
	ubuntu_image_extra_args="--extra-snaps $snap"
fi

ubuntu-image \
	--channel $channel \
	-o $image_name \
	--image-size 4G \
	$ubuntu_image_extra_args \
	$model.model

kpartx -a $image_name
sleep 0.5

loop_path=`findfs LABEL=writable`
tmp_mount=`mktemp -d`

mount $loop_path $tmp_mount

core_snap=$(find $tmp_mount/system-data/var/lib/snapd/snaps -name "core_*.snap")
tmp_core=`mktemp -d`
mount $core_snap $tmp_core
# copy over all systemd units
mkdir -p $tmp_mount/system-data/etc/systemd
cp -rav $tmp_core/etc/systemd/* \
	$tmp_mount/system-data/etc/systemd/
# copy some more etc files into the writable area
mkdir -p $tmp_mount/system-data/etc/ssh
cp -av $tmp_core/etc/passwd $tmp_mount/system-data/etc/
cp -av $tmp_core/etc/shadow $tmp_mount/system-data/etc/
cp -av $tmp_core/etc/ssh/sshd_config $tmp_mount/system-data/etc/ssh
# mkdir -p $tmp_mount/system-data/var/lib/system-image
# cp -av $tmp_core/etc/system-image/writable-paths $tmp_mount/system-data/var/lib/system-image
umount $tmp_core
rm -rf $tmp_core

# allow root user to ssh into the system without password
# test_pass=`python -c 'import crypt; print crypt.crypt("test","Fx")'`
# ie, FxhZ/XVdPJNZE
sed -i 's/root:x:/root:FxhZ\/XVdPJNZE:/' $tmp_mount/system-data/etc/passwd
sed -i 's/root:x:/root:\!:/' $tmp_mount/system-data/etc/shadow
sed -i 's/\(PermitRootLogin\)\>.*/\1 yes/' $tmp_mount/system-data/etc/ssh/sshd_config
# sed -i 's/\(PermitEmptyPasswords\)\>.*/\1 yes/' $tmp_mount/system-data/etc/ssh/sshd_config

if false; then
    mkdir -p $tmp_mount/system-data/var/lib/extrausers
    echo 'test:FxhZ/XVdPJNZE:800:800:spread test:/root:/bin/bash' > $tmp_mount/system-data/var/lib/extrausers/passwd
    echo 'test:!:16891:0:99999:7:::' > $tmp_mount/system-data/var/lib/extrausers/shadow
    echo 'adm:x:4:syslog,test' > $tmp_mount/system-data/var/lib/extrausers/group
    echo 'test:x:800:' >> $tmp_mount/system-data/var/lib/extrausers/group
fi

# Create systemd service to run on firstboot and install our passwd/group overrides
if true; then
    mkdir -p $tmp_mount/system-data/etc/systemd/system
    cat << 'EOF' > $tmp_mount/system-data/etc/systemd/system/spread-access.service
[Unit]
Description=Configure spread access
After=networking.service

[Service]
Type=oneshot
ExecStart=/writable/system-data/var/lib/spread-access/run.sh
RemainAfterExit=no

[Install]
WantedBy=multi-user.target
EOF

    mkdir $tmp_mount/system-data/var/lib/spread-access
    cat << 'EOF' > $tmp_mount/system-data/var/lib/spread-access/run.sh
#!/bin/bash

set -e

echo "Start spread-access $(date -Iseconds --utc)"

# mount our special passwd/shadow files to permit spread access as root
mount --bind /writable/system-data/etc/passwd /etc/passwd
mount --bind /writable/system-data/etc/shadow /etc/shadow

EOF

    chmod +x $tmp_mount/system-data/var/lib/spread-access/run.sh

    # install the new service
    mkdir -p $tmp_mount/system-data/etc/systemd/system/multi-user.target.wants
    ln -sf /etc/systemd/system/spread-access.service \
       $tmp_mount/system-data/etc/systemd/system/multi-user.target.wants/spread-access.service
fi

umount $tmp_mount
kpartx -d $image_name
rm -rf $tmp_mount

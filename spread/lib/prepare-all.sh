#!/bin/bash

# We don't have to build a snap when we should use one from a
# channel
if [ -n "$SNAP_CHANNEL" ] ; then
	exit 0
fi

# If there is a snapweb snap prebuilt for us, lets take
# that one to speed things up.
if [ -e /home/snapweb/snapweb_*_amd64.snap ] ; then
	exit 0
fi


# Setup classic snap and build the snapweb snap in there
snap install --devmode --beta classic
cat <<-EOF > /home/test/build-snap.sh
#!/bin/sh
set -ex
apt update
apt install -y --force-yes snapcraft
cd /home/snapweb
snapcraft clean
snapcraft
EOF
chmod +x /home/test/build-snap.sh
sudo classic /home/test/build-snap.sh
snap remove classic

# Make sure we have a snap binary
test -e /home/snapweb/snapweb_*_amd64.snap

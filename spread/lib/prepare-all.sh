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

echo "Not trying to build snapweb on the test target: provide a pre-built snap"
test -e /home/snapweb/snapweb_*_amd64.snap

#!/bin/bash
#
# Push the snapweb snaps.

set -ev

amd64_snap_push_output=`snapcraft push *amd64.snap --release edge`
published_rev=`echo $amd64_snap_push_output | grep created | grep -o '[0-9]*'`
echo "New revision for snapweb amd64 pushed ($published_rev)"
snapcraft push *arm64.snap --release edge
snapcraft push *armhf.snap --release edge
snapcraft push *i386.snap --release edge

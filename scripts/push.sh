#!/bin/bash
#
# Push the snapweb snaps.

set -ev

snapcraft push *amd64.snap --release edge
snapcraft push *arm64.snap --release edge
snapcraft push *armhf.snap --release edge
snapcraft push *i386.snap --release edge

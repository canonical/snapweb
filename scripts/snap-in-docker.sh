#!/bin/bash
#
# Build the snapweb snap using a docker container.

set -ev

docker run -v $GOPATH:/go snapcore/snapcraft sh -c 'apt update && apt upgrade -y && cd /go/src/github.com/snapcore/snapweb && export GOPATH=/go PATH=/go/bin:$PATH && ./scripts/snap.sh'

#change the permissions to user travis
sudo chown travis:travis *.snap
sudo chown -R travis:travis node_modules


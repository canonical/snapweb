#!/bin/bash
#
# Push the snapweb snap using a docker container.

set -ev

docker run -v "${HOME}":/root -v $(pwd):$(pwd) -t ubuntu:xenial sh -c "apt update -qq && apt install snapcraft -y && cd $(pwd) && ./scripts/push.sh"

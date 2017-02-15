#!/bin/bash
#
# Build the snapweb snap.

set -ev

# Note: this should already be installed when using the snapweb-builder docker image
#       but is left here to perform quick test builds on the host

dpkg --add-architecture i386
apt update
apt install -y bzr gcc-5-multilib gcc-5-aarch64-linux-gnu gcc-5-arm-linux-gnueabihf gcc-aarch64-linux-gnu gcc-arm-linux-gnueabihf git golang-go libc6-dev:i386 nodejs-legacy wget apt-transport-https npm
apt upgrade -y
# copy node_modules cached in the docker image to speed things up and avoid ECONNRESET errors from npm
if [ -d /build ]; then
  cp -a /build .
fi
# refresh things just in case
npm install

./build.sh

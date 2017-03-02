FROM ubuntu:xenial

# Note: keep this on a single line to optimize the resulting image size

# install all of snapweb build deps from the deb archive
RUN dpkg --add-architecture i386 && apt update && apt dist-upgrade -y && apt install -y snapcraft bzr gcc-5-multilib gcc-5-aarch64-linux-gnu gcc-5-arm-linux-gnueabihf gcc-aarch64-linux-gnu gcc-arm-linux-gnueabihf git golang-go libc6-dev:i386 nodejs-legacy wget apt-transport-https npm && apt clean

# create a cache of the NPM packages required for building snapweb
ADD package.json /tmp/package.json
RUN cd /tmp && npm install && mkdir -p /build && cp -a /tmp/node_modules /build

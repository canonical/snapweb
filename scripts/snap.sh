#!/bin/bash
#
# Build the snapweb snap.

set -ev

dpkg --add-architecture i386
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt install -y bzr gcc-5-multilib gcc-5-aarch64-linux-gnu gcc-5-arm-linux-gnueabihf gcc-aarch64-linux-gnu gcc-arm-linux-gnueabihf git golang-go libc6-dev:i386 nodejs-legacy yarn
yarn install
./build.sh

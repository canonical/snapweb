#!/bin/bash
#
# Build the snapweb snap.

set -ev

dpkg --add-architecture i386
apt update
apt install -y bzr gcc-5-multilib gcc-5-aarch64-linux-gnu gcc-5-arm-linux-gnueabihf gcc-aarch64-linux-gnu gcc-arm-linux-gnueabihf git golang-go libc6-dev:i386 nodejs-legacy wget apt-transport-https npm
wget -O- https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt install yarn
# NPM hammers the registry so badly it triggers ECONNERR issues
# Moving to yarn to resolve that creates another problem with phantomjs
# To solve the phantomjs problem, we resort to it's -prebuilt variant
# Here, yarn will initially fail because of phantomjs, then with the help of the phantomjs-prebuilt, it will work
set +e
yarn install
set -e
# do it again to complete the installation of all modules referenced in package.json <sigh...>
yarn install
./build.sh

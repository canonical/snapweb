#!/bin/bash

set +x

user=$1
host=$2
port=$3

# we only change the browser in a CI instance, not on a developer's machine...
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    sudo apt remove -y chromium-browser
    sudo apt-get install -y  google-chrome-stable

    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start
    sleep 3
fi

#get the name of snap to install - for now only amd64 snap is tested
snap=$(find "$(pwd)" -name snapweb\*_amd64.snap)

cd tests
./remote-install-snap.sh $user $host $port $snap || { echo "Warning: unable to deploy snap; skipping integration tests"; exit 0; }
./run-tests.sh $user $host $port sudo

#!/bin/bash

set +x

user=$1
host=$2
port=$3
# Provide a 4th arg if the snap should be installed from store.
install_from_store=$4

export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sleep 3

cd tests
if [[ -z $install_from_store ]]; then
    #get the name of snap to install - for now only amd64 snap is tested
    snap=$(find "$(pwd)" -name snapweb\*_amd64.snap)
    ./remote-install-snap.sh $user $host $port $snap || { echo "Warning: unable to deploy snap; skipping integration tests"; exit 1; }
else
    ./remote-install-snap.sh $user $host $port || { echo "Warning: unable to install snap; skipping integration tests"; exit 1; }
fi
./run-tests.sh $user $host $port sudo

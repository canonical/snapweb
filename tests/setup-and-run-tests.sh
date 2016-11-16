#!/bin/bash

set +x

user=$1
host=$2
port=$3

export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sleep 3

cd ..
#get the name of snap to install - for now only amd64 snap is tested
snap=$(find "$(pwd)" -name snapweb\*_amd64.snap)

cd tests
./remote-install-snap.sh $user $host $port $snap
./run-tests.sh $user $host $port sudo

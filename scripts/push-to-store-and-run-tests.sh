#!/bin/bash
#
# Push the snapweb snap using a docker container.

set -ev

user=$1
host=$2
port=$3

ENDPOINT_SNAP_DETAILS='https://search.apps.ubuntu.com/api/v1/snaps/details'
CHANNEL=edge

get_current_revision() {
    echo `curl -s $ENDPOINT_SNAP_DETAILS/snapweb?channel=$CHANNEL \
        -H 'X-Ubuntu-Series: 16' -H 'X-Ubuntu-Architecture: amd64' \
        | python3 -c "import sys, json; print(json.load(sys.stdin)['revision'])"`
}

output=`docker run -v "${HOME}":/root -v $(pwd):$(pwd) -t ubuntu:xenial sh -c "apt update -qq && apt install snapcraft -y && cd $(pwd) && ./scripts/push.sh"`
# Only try to run tests if upload was successful.
if [[ $? -eq 0 ]]; then
    new_revision=`echo $output | grep "New revision for snapweb amd64 pushed" | awk -F '[()]' '{print $2}'`
    for i in {1..10}; do
        if [[ $(get_current_revision) -lt $new_revision ]]; then
            if [[ $i -eq 10 ]]; then
                echo "Revision not published after 100 seconds, exiting."
                exit 1
            fi
            sleep 10
        else
            echo "New revision published, running tests"
            ./tests/setup-and-run-tests.sh $user $host $port
        fi
    done
fi

#!/bin/sh

set -e

CONTAINER_NAME=snapweb-build

echo "Setting up lxc"
if ! lxc info $CONTAINER_NAME |grep Running ; then
    lxc launch -e images:ubuntu/xenial/amd64 $CONTAINER_NAME -c security.privileged=true
    lxc config device add snapweb-build homedir disk source=/home/$USER path=/home/ubuntu
fi

dst=$(echo $(pwd)|sed s/$USER/ubuntu/g)
lxc exec snapweb-build -- sh -ex -c "(cd $dst ; sh -ex ./build.sh)"

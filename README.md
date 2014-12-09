# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup.

You also need to

    sudo apt install libclick-0.4-dev pkg-config

## Building

To branch this project run

    mkdir -p $GOPATH/src/launchpad.net
    cd $GOPATH/src/launchpad.net
    bzr branch lp:clapper
    cd clapper
    ./build.sh

# Installing

Once you have a click package you can install it onto a remote snappy system
by running

     snappy-remote --url ssh://localhost:8022 install [package]

Assuming that 8022 is where ssh is listening on, e.g.; launched as:

     kvm -m 768 -redir :8022::22 -redir :8080::8080 -hda snappy.img

# Using

Given that the snappy system where it was installed on was created with

     kvm -m 768 -redir :8022::22 -redir :8080::8080 -hda snappy.img

Then pointing the browser to [http://localhost:8080] will take you to the
portal.

## API

### /api/v1/packages/

To install a package:

     curl -H "Content-Type: application/json" -d '{"package":"xkcd-webserver"}' http://localhost:8080/api/v1/packages/

To uninstall a package:

    curl -X DELETE http://localhost:8080/api/v1/packages/xkcd-webserver

To list packages:

     curl http://localhost:8080/api/v1/packages/

To get a specific package:

     curl http://localhost:8080/api/v1/packages/xkcd-webserver

To start or stop a service from a package:

    curl -w "\nstatus code: %{http_code}\n" -d '{"status":0}' http://localhost:8080/api/v1/packages/snappyd/snappyd

### /api/v1/store

This basically is a proxy to the store

    curl http://localhost:8080/api/v1/store/

## Web Front End

To install gulp tools:

    sudo apt-get install nodejs-legacy npm
    sudo npm install -g gulp
    cd ./www
    npm install

To build (& watch):
    gulp

Set hostname (YUI.Env.demoUrl):
    edit www/templates/layout.html

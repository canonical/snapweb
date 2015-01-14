# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup.

## Building

To branch this project run

    mkdir -p $GOPATH/src/launchpad.net
    cd $GOPATH/src/launchpad.net
    bzr branch lp:clapper
    cd clapper
    ./build.sh

To build the arm version do

    GOARCH=arm ./build.sh

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

### api/v1/systemimage/

To retrieve current system image info:

     curl http://localhost:8080/api/v1/systemimage/

To check for system image update:

     curl http://localhost:8080/api/v1/systemimage/checkForUpdate

To apply system image update:

     curl --data "" http://localhost:8080/api/v1/systemimage/

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

    curl -w "\nstatus code: %{http_code}\n" -d '{"status":0}' http://localhost:8080/api/v1/packages/webdm/snappyd

### /api/v1/store

This basically is a proxy to the store

    curl http://localhost:8080/api/v1/store/search
    curl http://localhost:8080/api/v1/store/search?q=xkcd

    curl http://localhost:8080/api/v1/store/package/com.ubuntu.snappy.xkcd-webserver

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

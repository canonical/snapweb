[![Build Status](https://travis-ci.org/snapcore/snapweb.svg?branch=master)](https://travis-ci.org/snapcore/snapweb)
[![Coverage Status](https://coveralls.io/repos/github/snapcore/snapweb/badge.svg?branch=master)](https://coveralls.io/github/snapcore/snapweb?branch=master)

# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup,
and nodejs and npm installed:

    sudo apt install nodejs-legacy npm snapcraft git bzr

Install global npm modules without sudo:

    cat > ~/.npmrc <<-EOF
      root = $HOME/node/lib/node_modules
      prefix = $HOME/node
      binroot = $HOME/node/bin
      manroot = $HOME/node/man
    EOF

Setup the environment:

    mkdir ~/node
    export PATH=$PATH:$HOME/node/bin
    export NODE_PATH=$HOME/node/lib/node_modules

Branch:

    mkdir -p $GOPATH/src/github.com/snapcore
    cd $GOPATH/src/github.com/snapcore
    git clone git@github.com:snapcore/snapweb.git
    cd snapweb

Install:

    npm install -g --prefix=$(npm config get prefix) gulp
    npm install

## Building

    cd $GOPATH/src/github.com/snapcore/snapweb
    ./build.sh

# Installing

Once you have a snap you can transfer it onto a running snappy system and from
there install it by running:

     sudo snap install --force-dangerous [snap]

# Using

Given that the snappy system where it was installed on was created with

     kvm -m 768 -redir :8022::22 -redir :4200::4200 -hda snappy.img

Then pointing the browser to [http://localhost:4200] will take you to the
portal.

## Local development

After installing the snap, as explained above, deactivate it:

    sudo snap deactivate snapweb

# Building the go binary

To build the go binary locally:

    go build -o snapweb cmd/snapweb/\*.go  # This will create ./snapweb

# Processing JavaScript and Sass

To prepare JavaScript and compile Sass files into CSS:

    gulp

# Running

    ./snapweb  # Run the local server

Now browse to <http://localhost:4200>.

## API

### /api/v2/packages/

To install a package:

     curl -H "Content-Type: application/json" -d '{"package":"xkcd-webserver"}' http://localhost:4200/api/v2/packages/

To uninstall a package:

    curl -X DELETE http://localhost:4200/api/v2/packages/xkcd-webserver

To list packages:

     curl http://localhost:4200/api/v2/packages/

To get a specific package:

     curl http://localhost:4200/api/v2/packages/xkcd-webserver

### Dependencies handling

To generate dependencies.tsv you need `godeps`, so

    go get launchpad.net/godeps

To obtain the correct dependencies for the project, run:

    godeps -t -u dependencies.tsv

If the dependencies need updating

    godeps -t ./... > dependencies.tsv

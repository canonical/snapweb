[![Build Status](https://travis-ci.org/snapcore/snapweb.svg?branch=master)](https://travis-ci.org/snapcore/snapweb)
[![Coverage Status](https://coveralls.io/repos/github/snapcore/snapweb/badge.svg?branch=master)](https://coveralls.io/github/snapcore/snapweb?branch=master)

# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup,
and nodejs and npm installed:

    sudo apt install nodejs-legacy npm

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
    # omit the architecture below to build for all architectures at once
    ./build.sh amd64

# Installing

Once you have a snap built locally, you can test it on your system by doing:

     snap install snwpweb_<version>.snap --dangerous

The --dangerous flag is necessary for installing locally built snaps, which
have not been signed by the store.

# Using

Connect to the Snapweb interface with this URL: [http://localhost:4200/]

Snapweb will automatically redirect to HTTPS on port 4201, using a self-signed
certificate.

Warning : if testing snapweb inside a VM with redirected ports, be sure to
connect directly to the HTTPS socket, as the HTTP redirect won't work.

For example, starting a VM with:

     kvm -m 768 -redir :8022::22 -redir :8201::4201 -hda snappy.img

Point the browser directly to [https://localhost:8201]

Note that in all cases you will now need an access token to use snapweb.
Connect via ssh and do:

     sudo snapweb.generate-token

Then copy/paste the token in the Web UI.

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


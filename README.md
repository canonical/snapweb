[![Build Status](https://travis-ci.org/snapcore/snapweb.svg?branch=master)](https://travis-ci.org/snapcore/snapweb)
[![Coverage Status](https://coveralls.io/repos/github/snapcore/snapweb/badge.svg?branch=master)](https://coveralls.io/github/snapcore/snapweb?branch=master)

# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup,
and nodejs and npm installed:

    sudo apt install nodejs-legacy npm snapcraft bzr

Install global npm modules without sudo:

    cat > ~/.npmrc <<-EOF
	root = $HOME/node/lib/node_modules
	prefix = $HOME/node
	binroot = $HOME/node/bin
	manroot = $HOME/node/man
	EOF

Setup the environment:

    mkdir ~/node
    export PATH=$PATH:$HOME/node/bin:$GOPATH/bin
    export NODE_PATH=$HOME/node/lib/node_modules

Branch:

    mkdir -p $GOPATH/src/github.com/snapcore
    cd $GOPATH/src/github.com/snapcore
    git clone git@github.com:snapcore/snapweb.git
    cd snapweb
    
Install:

    # this script does a npm install using yarn and fixes some extra issues
    # with dependencies
    ./scripts/npm-install.sh
    ./scripts/get-go-deps.sh


## Building

    cd $GOPATH/src/github.com/snapcore/snapweb
    # omit the architecture specified below ('amd64') to build for all architectures at once
    ./build.sh amd64

# Installing

Once you have a snap built locally, you can test it on your system by doing:

     snap install snapweb_<version>.snap --dangerous

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
Depending on where you installed the snap package (locally or in a vm)
run the following command (possibly via ssh in the case of a vm):

     sudo snapweb.generate-token

Then copy/paste the token in the Web UI when requested.

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


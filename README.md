# Building

## Prerequisites

This assumes you have a working go environment with a GOPATH env var setup
and nodejs and npm installed:

    sudo apt-get install nodejs-legacy npm

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

    mkdir -p $GOPATH/src/launchpad.net
    cd $GOPATH/src/launchpad.net
    bzr branch lp:webdm
    cd webdm

Install:

    npm install -g --prefix=$(npm config get prefix) gulp
    npm install

## Building

    go get github.com/gorilla/mux
    cd $GOPATH/src/launchpad.net/webdm
    ./build.sh

Important Note: to have a functional store front-end, you need to patch
github.com/ubuntu-core/snappy/release/release.go
 // Setup is used to initialiaze the release information for the system
 func Setup(rootDir string) error {
-       rel = Release{Flavor: "core", Series: "rolling", Channel: "edge"}
+       rel = Release{Flavor: "core", Series: "15.04", Channel: "edge"}


# Installing

Once you have a click package you can install it onto a remote snappy system
by running

     snappy-remote --url ssh://localhost:8022 install [package]

Assuming that 8022 is where ssh is listening on, e.g.; launched as:

     kvm -m 768 -redir :8022::22 -redir :4200::4200 -hda snappy.img

# Using

Given that the snappy system where it was installed on was created with

     kvm -m 768 -redir :8022::22 -redir :4200::4200 -hda snappy.img

Then pointing the browser to [http://localhost:4200] will take you to the
portal.

## API

### /api/v1/packages/

To install a package:

     curl -H "Content-Type: application/json" -d '{"package":"xkcd-webserver"}' http://localhost:4200/api/v1/packages/

To uninstall a package:

    curl -X DELETE http://localhost:4200/api/v1/packages/xkcd-webserver

To list packages:

     curl http://localhost:4200/api/v1/packages/

To get a specific package:

     curl http://localhost:4200/api/v1/packages/xkcd-webserver

To start or stop a service from a package:

    curl -w "\nstatus code: %{http_code}\n" -d '{"status":0}' http://localhost:4200/api/v1/packages/webdm/snappyd

To get the icon for a package:

     curl http://localhost:4200/api/v1/packages/xkcd-webserver/icon

### /api/v1/oem

Grabs oem information from the oem package

    curl http://localhost:4200/api/v1/oem/ && echo
    {“name”:”beagleboneblack.element14”,”vendor”:”element14”,”icon”:”meta/element14.png”,”version”:”1.0”,”type”:”oem”,”branding”:{“name”:”Beagle Bone Black”,”subname”:”element14”},”store”:{“oem-key”:”123456”}}

And OEM package needs to be installed, example OEM package can be found on
[https://chinstrap.canonical.com/~sergiusens/snaps/beagleboneblack.element14_1.0_all.snap]

### /api/v1/store

This basically is a proxy to the store

    curl http://localhost:4200/api/v1/store/search
    curl http://localhost:4200/api/v1/store/search?q=xkcd

    curl http://localhost:4200/api/v1/store/package/com.ubuntu.snappy.xkcd-webserver

### Dependencies handling

To generate dependencies.tsv you need `godeps`, so

    go get launchpad.net/godeps

To obtain the correct dependencies for the project, run:

    godeps -t -u dependencies.tsv

If the dependencies need updating

    godeps -t ./... > dependencies.tsv


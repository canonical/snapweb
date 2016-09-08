[![Build Status](https://travis-ci.org/snapcore/snapweb.svg?branch=master)](https://travis-ci.org/snapcore/snapweb)
[![Coverage Status](https://coveralls.io/repos/github/snapcore/snapweb/badge.svg?branch=master)](https://coveralls.io/github/snapcore/snapweb?branch=master)

# Building

To build from source just use snapcraft (works with ubuntu 16.04 or later):

    sudo apt update && sudo apt install -y snapcraft git
    git clone https://github.com/snapcore/snapweb && cd snapweb
    snapcraft

# Installing

Once you have a snap you can transfer it onto a running snappy system and from
there install it by running:

     sudo snap install [snap]

# Using

Given that the snappy system where it was installed on was created with

     kvm -m 768 -redir :8022::22 -redir :4200::4200 -hda snappy.img

Then pointing the browser to [http://localhost:4200] will take you to the
portal.

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

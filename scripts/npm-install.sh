#!/bin/sh
#

set -eu

# common npm/yarn install process, to avoid repeating the same workarounds
npm_install()
{
    echo Obtaining npm dependencies
    set +e
    npm install -g yarn
    yarn install
    set -e
    # twice, to cope with phantomjs postinstall issue
    npm install phantomjs-prebuilt
    export PHANTOMJS_BIN=`pwd`/node_modules/.bin/phantomjs
    # third time to fix other postinstall woes
    npm rebuild node-sass
    npm install reactify
}

npm_install

#!/bin/sh

set -e

builddir=$(mktemp -d)
trap 'rm -rf "$builddir"' EXIT

cp -r pkg/. $builddir
mkdir $builddir/www
cp -r www/public www/templates www/mock-api $builddir/www
cd $builddir

go build launchpad.net/clapper/cmd/snappyd

cd -

snappy build $builddir

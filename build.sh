#!/bin/sh

set -e

AVAHI_VERSION="0.6.31-4ubuntu4snap2"
LIBDAEMON0_VERSION="0.14-6"

get_arch() {
    arch=$1

    case $arch in
        amd64)
            plat_abi=x86_64-linux-gnu
        ;;
        arm)
            plat_abi=arm-linux-gnueabihf
        ;;
        armhf)
            plat_abi=arm-linux-gnueabihf
        ;;
        *)
            echo "bad platform"
            exit 1
        ;;
    esac

    echo $plat_abi
}

gobuild() {
    arch=$1

    plat_abi=$(get_arch $arch)

    mkdir -p "bin/$plat_abi"
    cd "bin/$plat_abi"
    GOARCH=$arch GOARM=7 CGO_ENABLED=1 CC=${plat_abi}-gcc go build -ldflags "-extld=${plat_abi}-gcc" launchpad.net/webdm/cmd/snappyd
    cd - > /dev/null
}

echo "Building web assets with gulp..."
gulp --gulpfile www/gulpfile.js

orig_pwd=$(pwd)

builddir=$(mktemp -d)
trap 'rm -rf "$builddir"' EXIT

cp -r pkg/. $builddir
mkdir $builddir/www
cp -r www/public www/templates $builddir/www
cd $builddir

sed -i 's/\(architecture: \)UNKNOWN_ARCH/\1[amd64, armhf]/' \
    $builddir/meta/package.yaml

gobuild arm
gobuild amd64

cd "$orig_pwd"

snappy build $builddir

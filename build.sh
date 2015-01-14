#!/bin/sh

set -e

gobuild() {
    arch=$1

    case $arch in
        amd64)
            plat_abi=x86_64-linux-gnu
        ;;
        arm)
            plat_abi=arm-linux-gnueabihf
        ;;
        *)
            echo "unknown platform for snappy-magic: $platform. remember to file a bug or better yet: fix it :)"
            exit 1
        ;;
    esac

    mkdir -p "bin/$plat_abi"
    cd "bin/$plat_abi"
    GOARCH=$arch go build launchpad.net/clapper/cmd/snappyd
    cd - > /dev/null
}

orig_pwd=$(pwd)

builddir=$(mktemp -d)
trap 'rm -rf "$builddir"' EXIT

cp -r pkg/. $builddir
mkdir $builddir/www
cp -r www/public www/templates www/mock-api $builddir/www
cd $builddir

sed -i 's/\(architecture: \)UNKNOWN_ARCH/\1[amd64, armhf]/' \
    $builddir/meta/package.yaml

gobuild arm
gobuild amd64

cd "$orig_pwd"

snappy build $builddir

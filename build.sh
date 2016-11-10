#!/bin/sh

set -e

AVAHI_VERSION="0.6.31-4ubuntu4snap2"
LIBDAEMON0_VERSION="0.14-6"

get_platform_abi() {
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
            echo "unknown platform for snappy-magic: $arch remember to file a bug or better yet: fix it :)"
            exit 1
        ;;
    esac

    echo $plat_abi
}

gobuild() {
    arch=$1

    plat_abi=$(get_platform_abi $arch)

    mkdir -p "bin/$plat_abi"
    cd "bin/$plat_abi"
    GOARCH=$arch GOARM=7 CGO_ENABLED=1 CC=${plat_abi}-gcc go build -ldflags "-extld=${plat_abi}-gcc" launchpad.net/webdm/cmd/snappyd
    GOARCH=$arch GOARM=7 CGO_ENABLED=1 CC=${plat_abi}-gcc go build -o generate-token -ldflags "-extld=${plat_abi}-gcc" $srcdir/cmd/generate-token/main.go
    cd - > /dev/null
}

echo "Building web assets with gulp..."
gulp

orig_pwd=$(pwd)

builddir=$(mktemp -d)
trap 'rm -rf "$builddir"' EXIT

echo Obtaining go dependencies
go get launchpad.net/godeps
godeps -u dependencies.tsv

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

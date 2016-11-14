#!/bin/sh

set -xe

AVAHI_VERSION="0.6.31-4ubuntu4snap2"
LIBDAEMON0_VERSION="0.14-6"

get_platform_abi() {
    arch=$1

    case $arch in
        amd64|386)
            plat_abi=x86_64-linux-gnu
        ;;
        arm)
            plat_abi=arm-linux-gnueabihf
        ;;
        armhf)
            plat_abi=arm-linux-gnueabihf
        ;;
        arm64)
            plat_abi=aarch64-linux-gnu
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

    if [ $arch = "386" ]; then
        output_dir="bin/i686-linux-gnu"
    else
        output_dir="bin/$plat_abi"
    fi

    mkdir -p $output_dir
    cd $output_dir
    GOARCH=$arch GOARM=7 CGO_ENABLED=1 CC=${plat_abi}-gcc go build -ldflags "-extld=${plat_abi}-gcc" github.com/snapcore/snapweb/cmd/snapweb
    GOARCH=$arch GOARM=7 CGO_ENABLED=1 CC=${plat_abi}-gcc go build -o generate-token -ldflags "-extld=${plat_abi}-gcc" $srcdir/cmd/generate-token/main.go
    cp generate-token ../../
    cd - > /dev/null
}

echo "Building web assets with gulp..."
gulp

orig_pwd="$(pwd)"

top_builddir="$(mktemp -d)"
trap 'rm -rf "$top_builddir"' EXIT

echo Obtaining go dependencies
go get launchpad.net/godeps
godeps -u dependencies.tsv

# build one snap per arch
# for ARCH in amd64 ; do
for ARCH in amd64 arm64 armhf i386; do
    builddir="${top_builddir}/${ARCH}"
    mkdir -p "$builddir"

    srcdir=`pwd`
    cp -r pkg/. ${builddir}/
    mkdir $builddir/www
    cp -r www/public www/templates $builddir/www
    cd $builddir

    sed -i "s/\(architectures: \)UNKNOWN_ARCH/\1[$ARCH]/" \
        $builddir/meta/snap.yaml

    # *sigh* armhf in snappy is the go arm arch
    if [ $ARCH = armhf ]; then
        gobuild arm
    # and 386 vs i386
    elif [ $ARCH = i386 ]; then
       gobuild 386
    else
        gobuild $ARCH
    fi

    cd "$orig_pwd"
    snapcraft snap $builddir
done

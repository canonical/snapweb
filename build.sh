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
            echo "unknown platform for snappy-magic: $platform. remember to file a bug or better yet: fix it :)"
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
    GOARCH=$arch go build launchpad.net/clapper/cmd/snappyd
    cd - > /dev/null
}

prov_avahi() {
    arch=$1

    plat_abi=$(get_platform_abi $arch)

    avahi_deb=avahi-daemon_${AVAHI_VERSION}_${arch}.deb
    libdaemon0_deb=libdaemon0_${LIBDAEMON0_VERSION}_${arch}.deb

    avahi_url=https://launchpad.net/~phablet-team/+archive/ubuntu/gotools/+files/$avahi_deb
    libdaemon0_url=https://launchpad.net/ubuntu/+archive/primary/+files/$libdaemon0_deb

    avahi_dir=$(mktemp -d)
    #trap 'rm -rf "$avahi_dir"' EXIT

    mkdir -p "bin/$plat_abi"
    mkdir -p "lib/$plat_abi"

    # Copy files from WEBDM_AVAHI_POOL
    echo Checking if debs can be found in path declared by envvar 'WEBDM_AVAHI_POOL'
    [ -n "$WEBDM_AVAHI_POOL" ] && cp $WEBDM_AVAHI_POOL/*${arch}.deb $avahi_dir

    echo Fetching $avahi_url
    # Download avahi
    [ -f "$avahi_dir/$avahi_deb" ] || wget -q -P $avahi_dir -c $avahi_url

    echo Fetching $libdaemon0_url
    # Download libdaemon0
    [ -f "$avahi_dir/$libdaemon0_deb" ] || wget -q -P $avahi_dir -c $libdaemon0_url

    # Extract
    dpkg-deb -x $avahi_dir/$avahi_deb $avahi_dir/avahi
    dpkg-deb -x $avahi_dir/$libdaemon0_deb $avahi_dir/libdaemon0

    cp $avahi_dir/avahi/avahi-$arch/avahi-daemon "bin/$plat_abi"
    cp $avahi_dir/libdaemon0/usr/lib/$plat_abi/* "lib/$plat_abi"
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

prov_avahi armhf
prov_avahi amd64

cd "$orig_pwd"

snappy build $builddir

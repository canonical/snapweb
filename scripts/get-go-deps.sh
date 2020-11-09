#!/bin/sh

set -eu

echo Installing godeps
go get github.com/rogpeppe/godeps
export PATH=$PATH:$GOPATH/bin

echo Obtaining dependencies
godeps -u dependencies.tsv

echo Install golint
go get -d github.com/golang/lint/golint
(
    cd $GOPATH/src/github.com/golang/lint
    # revert to the last commit before go 1.5 support was dropped
    git checkout c6242afa6ced3be489e1184eb80bc2d85f1f5e7b .
)
go install github.com/golang/lint/golint

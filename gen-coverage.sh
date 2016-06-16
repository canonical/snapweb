#!/bin/sh

set -e

./run-checks --unit-go

go tool cover -html=.coverage-go/coverage.out -o .coverage-go/coverage.html

echo "Coverage HTML reports for the go code are available in .coverage-go/coverage.html"

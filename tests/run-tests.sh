#!/bin/bash

set -x

if [ $# -lt 3 ]
  then
    filename=$(basename -- "$0")
    echo "Not enough arguments supplied, please provide arguments in following order for DUT"
    echo "$ ./$filename <user> <IP> <ssh port>"
    exit 1
fi

user=$1
host=$2
port=$3

#skip the downloading if an extra arg is provided.
if [ -z "$4" ]
  then
    echo 'Setup the environment before running snapweb selenium test'
    echo '----------------------------------------------------------'
    wget -nc http://chromedriver.storage.googleapis.com/2.25/chromedriver_linux64.zip
    unzip -o chromedriver_linux64.zip

    wget -nc https://github.com/mozilla/geckodriver/releases/download/v0.11.1/geckodriver-v0.11.1-linux64.tar.gz
    tar -xvzf geckodriver-v0.11.1-linux64.tar.gz

    export PATH=$PATH:$PWD

    echo 'Download Standalone Selenium Server...'
    wget -nc https://selenium-release.storage.googleapis.com/3.0/selenium-server-standalone-3.0.1.jar

    npm install webdriverio --save-dev
    npm install chai --save-dev
    npm install wdio-mocha-framework --save-dev
    npm install wdio-junit-reporter --save-dev
    npm install ssh2 --save-dev
    npm install node-ssh --save-dev
fi

echo 'Launch Selenium Server ...'
java -jar ./selenium-server-standalone-3.0.1.jar &
pid=$!
echo $pid

sleep 3 # wait for selenium server to up and running.

echo 'Run selenium tests for snapweb service on given IP'
modules_dir="./node_modules"
if [ ! -d "$modules_dir" ]; then
  modules_dir="../node_modules"
fi

USER=$user HOST=$host PORT=$port $modules_dir/.bin/wdio -b https://$2:4201

trap "kill -9  $pid" 0

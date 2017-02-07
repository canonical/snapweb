#!/bin/bash

exitcode=0

if [ $# -lt 3 ]
  then
    filename=$(basename -- "$0")
    echo "Not enough arguments supplied, please provide arguments in following order for DUT"
    echo "$ ./$filename <user> <IP> <ssh port> <sudo>"
    echo "If sudo is required, then specify 4th arg as sudo"
    echo "If want to skip dowloading and installing part, provide 5th arg non empty"
    exit 1
fi

user=$1
host=$2
port=$3
sudo=false

if [ $4 = "sudo" ]; then
	sudo=true
fi

#skip the downloading if an extra arg is provided, for quick subsequent run locally.
if [ -z "$5" ]
  then
    echo 'Setup the environment before running snapweb selenium test'
    echo '----------------------------------------------------------'
    wget -nc http://chromedriver.storage.googleapis.com/2.25/chromedriver_linux64.zip
    unzip -o chromedriver_linux64.zip

    wget -nc https://github.com/mozilla/geckodriver/releases/download/v0.11.1/geckodriver-v0.11.1-linux64.tar.gz
    tar -xvzf geckodriver-v0.11.1-linux64.tar.gz

    export PATH=$PATH:$PWD

    echo 'Downloading Standalone Selenium Server...'
    wget -nc https://selenium-release.storage.googleapis.com/3.0/selenium-server-standalone-3.0.1.jar

#install npm deps
    npm install webdriverio --save-dev
    npm install chai --save-dev
    npm install wdio-mocha-framework --save-dev
    npm install wdio-junit-reporter --save-dev
    npm install ssh2 --save-dev
    npm install node-ssh --save-dev
fi

echo 'Launching Selenium Server ...'
java -jar ./selenium-server-standalone-3.0.1.jar > /dev/null 2>&1 &
pid=$!
exitcode=$?

sleep 3 # wait for selenium server to up and running.

modules_dir="./node_modules"
if [ ! -d "$modules_dir" ]; then
  modules_dir="../node_modules"
fi

echo "Run selenium tests for snapweb on $host:$port with user:$user/$sudo"
USER=$user HOST=$host PORT=$port SUDO=$sudo $modules_dir/.bin/wdio -b https://$2:4201
exitcode=$?

trap "kill -9  $pid" $exitcode

exit $exitcode

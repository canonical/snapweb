#!/bin/bash

token=$(sudo snapweb.generate-token | awk '{ if(NR==3) print $0 }')
echo $token

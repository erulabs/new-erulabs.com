#!/bin/bash

USAGE="./bin/deploy.sh name_or_hash"

if [ -z "$1" ]; then
  echo $USAGE
  exit
fi

tar -czvf ${1}.tar.gz _build
aws s3 cp -v ${1}.tar.gz s3://erulabs-deployments/${1}.tar.gz

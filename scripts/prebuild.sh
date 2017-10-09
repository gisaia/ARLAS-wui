#!/bin/bash

rm -rf node_modules/
npm install
if [[ -d ./node_modules/@gisaia-team/ ]] ; then
  mv node_modules/@gisaia-team/arlas-web-core node_modules 2>/dev/null
fi

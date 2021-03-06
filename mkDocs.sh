#!/bin/sh -e

## CREATE TARGET DIRECTORY ##
rm -rf target
mkdir target
mkdir target/generated-docs

## MOVE ALL THE DOCUMENTATION TO THE 'generated-docs' FOLDER ##
cp CHANGELOG.md target/generated-docs/CHANGELOG_ARLAS-wui.md
cp BROWSER_COMPATIBILITY.md target/generated-docs/BROWSER_COMPATIBILITY.md
if [ -d ./docs ] ; then
    cp -r docs/* target/generated-docs
fi

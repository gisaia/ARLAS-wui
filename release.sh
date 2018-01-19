#!/bin/bash
set -e

# dockerlogin=`docker info | sed '/Username:/!d;s/.* //'`
# if  [ -z "$dockerlogin"  ] ; then echo "your are not logged on dockerhub"; exit -1; else  echo "logged as "$dockerlogin ; fi

function clean {
    ARG=$?
	echo "==> Exit status = $ARG"
    exit $ARG
}
trap clean EXIT

usage(){
	echo "Usage: ./release.sh -rel=X [--no-tests]"
  echo " -rel|--app-release   release arlas-app X version"
	echo " -dev|--app-dev   development arlas-app version (-SNAPSHOT qualifier will be automatically added)"
	echo " --no-tests           do not run integration tests"
	exit 1
}

TESTS="YES"
for i in "$@"
do
case $i in
    -rel=*|--app-release=*)
    APP_REL="${i#*=}"
    shift # past argument=value
    ;;
    -dev=*|--app-dev=*)
    APP_DEV="${i#*=}"
    shift # past argument=value
    ;;
    --no-tests)
    TESTS="NO"
    shift # past argument with no value
    ;;
    *)
      # unknown option
    ;;
esac
done

VERSION="${APP_REL}"
DEV="${APP_DEV}"

echo "==> Get develop branch"
git checkout develop
git pull origin develop

if [ "$TESTS" == "YES" ]; then
  ng lint
  ng test
  ng e2e
else
  echo "==> Skip tests"
fi

echo "==> Set version"
npm --no-git-tag-version version ${VERSION}
git add package.json
git commit -m "change app version to ${VERSION}"
git push origin develop

echo "==> Merge develop into master"
git checkout master
git pull origin master
git merge origin/develop -m "Merge develop into master"
git add .
commit_message_master = "prod automatic release ${VERSION}"
git commit -m "$commit_message_master" --allow-empty
echo "  -- Push to master"
git push origin master

echo "  -- Create and push tag"
git tag -a v${VERSION} -m "$commit_message_master"
git push origin v${VERSION}

echo "==> Build (the artifact will be stored in the 'dist' directory)"
yarn install
ng build -prod

echo "==> Docker"
docker build --tag arlas-wui:${VERSION} --tag arlas-wui:latest --tag gisaia/arlas-wui:${VERSION} --tag gisaia/arlas-wui:latest .

docker push gisaia/arlas-wui:${VERSION}
docker push gisaia/arlas-wui:latest

echo "==> Go back to develop branch"
git checkout package-lock.json
git checkout develop
git pull origin develop

npm --no-git-tag-version version "${DEV}-dev"
git add package.json
git commit -m "development version ${DEV}-dev"
git push origin develop

echo "==> Well done :)"

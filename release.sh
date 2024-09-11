#!/bin/bash
set -e
SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd)"
PROJECT_ROOT_DIRECTORY="$(dirname "$SCRIPT_DIRECTORY")"

# dockerlogin=`docker info | sed '/Username:/!d;s/.* //'`
# if  [ -z "$dockerlogin"  ] ; then echo "your are not logged on dockerhub"; exit -1; else  echo "logged as "$dockerlogin ; fi

if  [ -z "$GITHUB_CHANGELOG_TOKEN"  ] ; then echo "Please set GITHUB_CHANGELOG_TOKEN environment variable"; exit -1; fi

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
	echo " --no-tests    Skip running integration tests"
	echo " --not-latest  Doesn't tag the release version as the latest."
    echo " -s|--stage    Stage of the release : beta | rc | stable. If --stage is 'rc' or 'beta', there is no merge of develop into master (if -ref_branch=develop)"
    echo " -i|--stage_iteration=n, the released version will be : [x].[y].[z]-beta.[n] OR  [x].[y].[z]-rc.[n] according to the given --stage"	
 	echo " -ref_branch | --reference_branch  from which branch to start the release."
    echo "    Add -ref_branch=develop for a new official release"
    echo "    Add -ref_branch=x.x.x for a maintenance release"
	exit 1
}
STAGE="stable"
TESTS="YES"
IS_LATEST_VERSION="YES"
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
    --not-latest)
    IS_LATEST_VERSION="NO"
    shift # past argument with no value
    ;;
    -ref_branch=*|--reference_branch=*)
    REF_BRANCH="${i#*=}"
    shift # past argument=value
    ;;
     -s=*|--stage=*)
    STAGE="${i#*=}"
    shift # past argument=value
    ;;
    -i=*|--stage_iteration=*)
    STAGE_ITERATION="${i#*=}"
    shift # past argument=value
    ;;
    *)
      # unknown option
    ;;
esac
done

VERSION="${APP_REL}"
DEV="${APP_DEV}"

if [ "$TESTS" == "YES" ]; then
  ng lint
  ng test
  ng e2e
else
  echo "==> Skip tests"
fi

if [ -z ${REF_BRANCH+x} ];
    then
        echo ""
        echo "###########"
        echo "-ref_branch is missing."
        echo "  Add -ref_branch=develop for a new official release"
        echo "  Add -ref_branch=x.x.x for a maintenance release"
        echo "###########"
        echo ""
        usage;
fi

if [ -z ${STAGE+x} ];
    then
        echo ""
        echo "###########"
        echo "-s=*|--stage* is missing."
        echo "  Add --stage=beta|rc|stable to define the release stage"
        echo "###########"
        echo ""
        usage;
fi

if [ "${STAGE}" != "beta" ] && [ "${STAGE}" != "rc" ] && [ "${STAGE}" != "stable" ];
    then
        echo ""
        echo "###########"
        echo "Stage ${STAGE} is invalid."
        echo "  Add --stage=beta|rc|stable to define the release stage"
        echo "###########"
        echo ""
        usage;
fi

if [ "${STAGE}" == "beta" ] || [ "${STAGE}" == "rc" ];
    then
        if [ -z ${STAGE_ITERATION+x} ];
            then
                echo ""
                echo "###########"
                echo "You chose to release this version as ${STAGE}."
                echo "--stage_iteration is missing."
                echo "  Add -i=n|--stage_iteration=n, the released version will be : [x].[y].[z]-${STAGE}.[n]"
                echo "###########"
                echo ""
                usage;
        fi
fi

echo "==> Get $REF_BRANCH branch"
git checkout "$REF_BRANCH"
git pull origin "$REF_BRANCH"


if [ "${STAGE}" == "rc" ] || [ "${STAGE}" == "beta" ];
    then
        VERSION="${APP_REL}-${STAGE}.${STAGE_ITERATION}"
fi

echo "==> Set version"
npm --no-git-tag-version version ${VERSION}
npm --no-git-tag-version --prefix src version ${VERSION}
git add package.json
git add src/package.json

echo "  -- Create and push tag"
git tag -a v${VERSION} -m "prod automatic release ${VERSION}"
git push origin v${VERSION}

echo "==> Generate CHANGELOG"
docker run -it --rm -v "$(pwd)":/usr/local/src/your-app gisaia/github-changelog-generator:latest github_changelog_generator \
  -u gisaia -p ARLAS-WUI --token ${GITHUB_CHANGELOG_TOKEN} --no-pr-wo-labels --no-issues-wo-labels --no-unreleased \
  --issue-line-labels conf,documentation \
  --exclude-labels type:duplicate,type:question,type:wontfix,type:invalid \
  --bug-labels type:bug --enhancement-labels type:enhancement --breaking-labels type:breaking \
  --enhancement-label "**New stuff:**" --issues-label "**Miscellaneous:**" --since-tag v4.0.0

echo "  -- Remove tag to add generated CHANGELOG"
git tag -d v${VERSION}
git push origin :v${VERSION}

echo "  -- Commit release version"
git commit -a -m "prod automatic release ${VERSION}"
git tag v${VERSION}
git push origin v${VERSION}
git push origin ${REF_BRANCH}

echo "==> Clean local environment"
npm cache clean --force
rm -rf node_modules/

echo "==> Docker"
docker build -f docker/Dockerfile-production --no-cache --build-arg version=${VERSION} --tag gisaia/arlas-wui:${VERSION} .
docker build -f docker/Dockerfile-production-no-analytics --no-cache --build-arg version=${VERSION} --tag gisaia/arlas-wui:${VERSION}-no-analytics .

docker push gisaia/arlas-wui:${VERSION}
docker push gisaia/arlas-wui:${VERSION}-no-analytics
if [ "${STAGE}" == "stable" ] && [ "${IS_LATEST_VERSION}" == "YES" ];
    then
    docker tag gisaia/arlas-wui:${VERSION} gisaia/arlas-wui:latest
    docker push gisaia/arlas-wui:latest
fi

echo "==> Build arlas-wui library"
rm -rf dist
npm install
npm run build-lib
cd dist/arlas-wui
echo "==> Publish to npm"
if [ "${STAGE}" == "rc" ] || [ "${STAGE}" == "beta" ];
    then
    echo "  -- tagged as ${STAGE}"
    npm publish --tag=${STAGE}
else
    npm publish
fi
cd ../..

echo "==> Clean local environment"
npm cache clean --force
rm -rf node_modules/

if [ "${REF_BRANCH}" == "develop" ] && [ "${STAGE}" == "stable" ];
    then
    echo "==> Merge develop into master"
    git checkout master
    git pull origin master
    git merge origin/develop
    git push origin master

    git checkout develop
    git pull origin develop
    git rebase origin/master
fi

npm --no-git-tag-version version "${DEV}-dev"
npm --no-git-tag-version --prefix src version "${DEV}-dev"

git commit -a -m "development version ${DEV}-dev"
git push origin ${REF_BRANCH}

echo "==> Well done :)"

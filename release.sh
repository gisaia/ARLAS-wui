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
	echo " --no-tests           do not run integration tests"
  echo " -beta|--beta    if present, release and publish the npm package with beta tag. If the beta is launched from develop, there is no merge of develop into master"
  echo " -beta_n|--beta_number=n, the released version will be : [x].[y].[z]-beta.[n]"
	echo " -ref_branch | --reference_branch  from which branch to start the release."
  echo "    Add -ref_branch=develop for a new official release"
  echo "    Add -ref_branch=x.x.x for a maintenance release"
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
    -ref_branch=*|--reference_branch=*)
    REF_BRANCH="${i#*=}"
    shift # past argument=value
    ;;
     -beta|--beta)
    ARLAS_BETA="true"
    shift # past argument=value
    ;;
    -beta_n=*|--beta_number=*)
    BETA_NUMBER="${i#*=}"
    shift # past argument=value
    ;;
    *)
      # unknown option
    ;;
esac
done

VERSION="${APP_REL}"
DEV="${APP_DEV}"
ARLAS_BETA="false"

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

if [ "${ARLAS_BETA}" == "true" ];
    then
        if [ -z ${BETA_NUMBER+x} ];
        then
            echo ""
            echo "###########"
            echo "You chose to release this version as beta."
            echo "--beta_number is missing."
            echo "  Add --beta_number=n, the released version will be : [x].[y].[z]-beta.[n]"
            echo "###########"
            echo ""
            usage;
        fi
fi

echo "==> Get $REF_BRANCH branch"
git checkout "$REF_BRANCH"
git pull origin "$REF_BRANCH"

if [ "${ARLAS_BETA}" == "true" ];
    then
    VERSION="${APP_REL}-beta.${BETA_NUMBER}"
fi

echo "VERSION   ${VERSION}"

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
docker build --no-cache --build-arg version=${VERSION} --tag gisaia/arlas-wui:${VERSION} --tag gisaia/arlas-wui:latest .

docker push gisaia/arlas-wui:${VERSION}
if [ "${ARLAS_BETA}" == "false" ];
    then
    docker push gisaia/arlas-wui:latest
fi

echo "==> Publish to npm"
rm -rf dist
npm install
npm run build-lib
cd dist/arlas-wui
if [ "${ARLAS_BETA}" == "true" ];
    then
    echo "  -- tagged as beta"
    npm publish --tag=beta
else 
    npm publish
fi
cd ../..

echo "==> Clean local environment"
npm cache clean --force
rm -rf node_modules/

if [ "${REF_BRANCH}" == "develop" ] && [ "${ARLAS_BETA}" == "false" ];
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

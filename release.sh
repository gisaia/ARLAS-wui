#!/bin/bash
set -e
SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd)"
PROJECT_ROOT_DIRECTORY="$(dirname "$SCRIPT_DIRECTORY")"

if  [ -z "$GITHUB_CHANGELOG_TOKEN"  ] ; then echo "Please set GITHUB_CHANGELOG_TOKEN environment variable"; exit -1; fi

echo "=> Docker login"
echo "${DOCKER_PASSWORD}" | docker login -u ${DOCKER_USERNAME} --password-stdin

function clean {
    ARG=$?
	echo "==> Exit status = $ARG"
    exit $ARG
}
trap clean EXIT

usage(){
	echo "Usage: ./release.sh -version=X"
    echo " -version                          Release ARLAS-wui X version"
	echo " --not-latest                      Doesn't tag the release version as the latest."
    echo " -s|--stage                        Stage of the release : beta | rc | stable. If --stage is 'rc' or 'beta', there is no merge of develop into master (if -ref_branch=develop)"
    echo " -i|--stage_iteration=n            The released version will be : [x].[y].[z]-beta.[n] OR  [x].[y].[z]-rc.[n] according to the given --stage"
 	echo " -ref_branch|--reference_branch    From which branch to start the release."
    echo "    Add -ref_branch=develop for a new official release"
    echo "    Add -ref_branch=x.x.x for a maintenance release"
	exit 1
}

send_chat_message(){
    MESSAGE=$1
    if [ -z "$GOOGLE_CHAT_RELEASE_CHANEL" ] ; then
        echo "Environement variable GOOGLE_CHAT_RELEASE_CHANEL is not definied ... skipping message publishing"
    else
        DATA='{"text":"'${MESSAGE}'"}'
        echo $DATA
        curl -X POST --header "Content-Type:application/json" $GOOGLE_CHAT_RELEASE_CHANEL -d "${DATA}"
    fi
}

STAGE="stable"
TESTS="YES"
IS_LATEST_VERSION="YES"

for i in "$@"
do
case $i in
    -version=*)
    VERSION="${i#*=}"
    shift # past argument=value
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
    VERSION="${VERSION}-${STAGE}.${STAGE_ITERATION}"
fi

echo "==> Set version"
npm --no-git-tag-version version ${VERSION}
npm --no-git-tag-version --prefix src version ${VERSION}

git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

git add package.json
git add src/package.json

echo "  -- Create and push tag"
git tag -a v${VERSION} -m "prod automatic release ${VERSION}"
git push origin v${VERSION}

echo "==> Generate CHANGELOG"
docker run --rm -v "$(pwd)":/usr/local/src/your-app gisaia/github-changelog-generator:latest github_changelog_generator \
  -u gisaia -p ARLAS-WUI --token ${GITHUB_CHANGELOG_TOKEN} --no-pr-wo-labels --no-issues-wo-labels --no-compare-link --no-unreleased \
  --issue-line-labels conf,documentation \
  --exclude-labels type:duplicate,type:question,type:wontfix,type:invalid \
  --bug-labels type:bug --enhancement-labels type:enhancement --breaking-labels type:breaking \
  --enhancement-label "**New stuff:**" --issues-label "**Miscellaneous:**" \
  --exclude-tags-regex 'rc|beta' \
  --since-tag v4.0.0

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
docker build -f docker/Dockerfile --no-cache --build-arg version=${VERSION} --build-arg WORKSPACE=cloud --tag gisaia/arlas-wui-cloud:${VERSION} .
docker build -f docker/Dockerfile --no-cache --build-arg version=${VERSION} --build-arg WORKSPACE=opensource  --tag gisaia/arlas-wui:${VERSION} .

docker push gisaia/arlas-wui-cloud:${VERSION}
docker push gisaia/arlas-wui:${VERSION}
if [ "${STAGE}" == "stable" ] && [ "${IS_LATEST_VERSION}" == "YES" ];
    then
    docker tag gisaia/arlas-wui:${VERSION} gisaia/arlas-wui:latest
    docker tag gisaia/arlas-wui-cloud:${VERSION} gisaia/arlas-wui-cloud:latest
    docker push gisaia/arlas-wui-cloud:latest
    docker push gisaia/arlas-wui:latest
fi

echo "==> Build arlas-wui library"
rm -rf dist
rm -rf node_modules/
npm install --workspaces=false 
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

IFS='.' read -ra TAB <<< "$VERSION"
major=${TAB[0]}
minor=${TAB[1]}
newminor=$(( $minor + 1 ))
newDevVersion=${major}.${newminor}.0

npm --no-git-tag-version version "${newDevVersion}-dev"
npm --no-git-tag-version --prefix src version "${newDevVersion}-dev"

git commit -a -m "development version ${newDevVersion}-dev"
git push origin ${REF_BRANCH}

echo "==> Well done :)"

if [ "$STAGE" == "stable" ] || [ "$STAGE" == "rc" ];
    then
    send_chat_message "Release of arlas-wui, version ${VERSION}"
    send_chat_message "Release of arlas-wui-cloud, version ${VERSION}"

fi
#!/usr/bin/env bash

set -e errexit -e nounset -e pipefail

cat <<EOF
###############################
#    HTTP RESOURCE FETCHER    #
###############################
Downloads http resources and stores them in the provided locations by looking at \$HTTP_RESOURCES env variable. Must be of the form:
path1@url1,path2@url2,...
so that url1 is fetched and stored in path1 and so on ...

EOF


if [[ -v HTTP_RESOURCES ]]; then
  (IFS=','; for RESOURCE in $HTTP_RESOURCES; do
    (IFS='@';
      TARGET_URL=(${RESOURCE})
      TARGET="${TARGET_URL[0]}"
      URL="${TARGET_URL[1]}"
      echo "Fetching $URL and store it in ${TARGET} ..."
      CODE=`curl \
        --location \
        --output "${TARGET}" \
        --show-error \
        --silent \
        --write-out "%{http_code}" \
        "${URL}"`
      if [[ "${CODE}" == "200" ]]
      then
        if [[ -f "${TARGET}" ]]
        then
          echo "ok."
        else
          >&2 echo "Failed to save in ${TARGET}"
          exit 1
        fi
      else
        >&2 echo "Failed to fetch ${URL}"
        exit 1
      fi
    )
  done)
fi

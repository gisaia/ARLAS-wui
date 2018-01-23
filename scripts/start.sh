#!/bin/sh

fetchConfiguration(){
  echo "Download the CATALOG configuration file from "${ARLAS_WUI_CONFIGURATION_URL}" ..."
  curl ${ARLAS_WUI_CONFIGURATION_URL} -o /usr/share/nginx/html/config.json && echo "Configuration file downloaded with success." || (echo "Failed to download the configuration file."; exit 1)
}

if [ -z "${ARLAS_WUI_CONFIGURATION_URL}" ]; then
  echo "The default container configuration file is used"
else
  fetchConfiguration;
fi

nginx -g "daemon off;"

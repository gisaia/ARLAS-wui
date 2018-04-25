#!/bin/sh

fetchConfiguration(){
  echo "Download the CATALOG configuration file from \"${ARLAS_WUI_CONFIGURATION_URL}\" ..."
  curl ${ARLAS_WUI_CONFIGURATION_URL} -o /usr/share/nginx/html/config.json && echo "Configuration file downloaded with success." || (echo "Failed to download the configuration file."; exit 1)
}

if [ -z "${ARLAS_WUI_CONFIGURATION_URL}" ]; then
  echo "The default catalog container configuration file is used"
else
  fetchConfiguration;
fi

fetchMapConfiguration(){
  echo "Download the CATALOG map configuration file from \"${ARLAS_WUI_MAP_CONFIGURATION_URL}\" ..."
  # Retrieve name of map configuration file
  # TODO : ARLAS_WUI_MAP_CONFIGURATION_FILENAME=`cat /usr/share/nginx/html/config.json | jq -r '.extraConfigs[0].configPath'`
  curl ${ARLAS_WUI_MAP_CONFIGURATION_URL} -o "/usr/share/nginx/html/config.map.json" && echo "Map configuration file downloaded with success." || (echo "Failed to download the map configuration file."; exit 1)
}

if [ -z "${ARLAS_WUI_MAP_CONFIGURATION_URL}" ]; then
  echo "The default catalog container map configuration file is used"
else
  fetchMapConfiguration;
fi

fetchAboutContent(){
  echo "Download the about.md file from \"${ARLAS_WUI_ABOUT_URL}\" ..."
  curl ${ARLAS_WUI_ABOUT_URL} -o "/usr/share/nginx/html/about.md" && echo "'About' file downloaded with success." || (echo "Failed to download the 'About' file."; exit 1)
}

if [ -z "${ARLAS_WUI_ABOUT_URL}" ]; then
  echo "The default 'about' file is used"
else
  fetchAboutContent;
fi

nginx -g "daemon off;"

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

fetchI18nENContent(){
  echo "Download the en.json file from \"${ARLAS_WUI_I18N_EN_URL}\" ..."
  curl ${ARLAS_WUI_I18N_EN_URL} -o "/usr/share/nginx/html/assets/i18n/en.json" && echo "'EN language' file downloaded with success." || (echo "Failed to download the 'EN language' file."; exit 1)
}

if [ -z "${ARLAS_WUI_I18N_EN_URL}" ]; then
  echo "The default 'EN language' file is used"
else
  fetchI18nENContent;
fi

fetchI18nFRContent(){
  echo "Download the fr.json file from \"${ARLAS_WUI_I18N_FR_URL}\" ..."
  curl ${ARLAS_WUI_I18N_FR_URL} -o "/usr/share/nginx/html/assets/i18n/fr.json" && echo "'FR language' file downloaded with success." || (echo "Failed to download the 'FR language' file."; exit 1)
}

if [ -z "${ARLAS_WUI_I18N_FR_URL}" ]; then
  echo "The default 'FR language' file is used"
else
  fetchI18nFRContent;
fi

if [ -z "${ARLAS_SERVER_URL}" ]; then
  ARLAS_SERVER_URL="http://demo.arlas.io/arlas/"
  export ARLAS_SERVER_URL
  echo "The default ARLAS-server url is used"
else
  echo ${ARLAS_SERVER_URL}  "is used as 'arlas.server.url'"
fi
if [ -z "${ARLAS_MAP_STYLE}" ]; then
  ARLAS_MAP_STYLE="http://demo.arlas.io:82/styles/positron/style.json"
  export ARLAS_MAP_STYLE
  echo "The default URL to the map tiles style url is used"
else
  echo ${ARLAS_MAP_STYLE}  "is used as map tiles style url "
fi
envsubst < /usr/share/nginx/html/config.json > /usr/share/nginx/html/config.json.tmp
mv /usr/share/nginx/html/config.json.tmp /usr/share/nginx/html/config.json

export HTTP_RESOURCES
/usr/share/nginx/fetch-conf-by-http.sh

nginx -g "daemon off;"

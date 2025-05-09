#!/bin/sh

if [ -z "${ARLAS_SERVER_URL}" ]; then
  ARLAS_SERVER_URL="http://demo.arlas.io/arlas/"
  export ARLAS_SERVER_URL
  echo "The default ARLAS-server url '${ARLAS_SERVER_URL}' is used"
else
  echo ${ARLAS_SERVER_URL} "is used for 'arlas.server.url'"
fi

if [ -z "${ARLAS_SERVER_COLLECTION}" ]; then
  ARLAS_SERVER_COLLECTION="foobar"
  export ARLAS_SERVER_COLLECTION
  echo "The default ARLAS-server collection '${ARLAS_SERVER_COLLECTION}' is used"
else
  echo ${ARLAS_SERVER_COLLECTION} "is used for 'arlas.server.collection'"
fi

if [ -z "${ARLAS_TAGGER_URL}" ]; then
  ARLAS_TAGGER_URL="http://localhost:9998"
  export ARLAS_TAGGER_URL
  echo "The default ARLAS-tagger url '${ARLAS_TAGGER_URL}' is used"
else
  echo ${ARLAS_TAGGER_URL} "is used for 'arlas.tagger.url'"
fi

if [ -z "${ARLAS_MAP_STYLE}" ]; then
  ARLAS_MAP_STYLE="http://demo.arlas.io:82/styles/positron/style.json"
  export ARLAS_MAP_STYLE
  echo "The default URL to the map tiles style url is used"
else
  echo ${ARLAS_MAP_STYLE}  "is used as map tiles style url "
fi

# Set Google Analytics key
if [ -z "${ARLAS_GOOGLE_ANALYTICS_KEY}" ]; then
  ARLAS_GOOGLE_ANALYTICS_KEY="XX-XXXXXXXXX-X"
  export ARLAS_GOOGLE_ANALYTICS_KEY
  echo "No key defined for Google Analytics"
else
  echo ${ARLAS_GOOGLE_ANALYTICS_KEY}  "is used as Google Analytics key "
fi

# Set zendesk key
if [ -z "${ARLAS_TICKETING_KEY}" ]; then
  ARLAS_TICKETING_KEY=NOT_CONFIGURED
  export ARLAS_TICKETING_KEY
  echo "No key defined for Zendesk ticketing"
else
  echo ${ARLAS_TICKETING_KEY}  "is used as Zendesk ticketing key "
fi

# Set Tab title name
if [ -z "${ARLAS_TAB_NAME}" ]; then
  ARLAS_TAB_NAME=NOT_CONFIGURED
  export ARLAS_TAB_NAME
  echo "No specific tab name for the app"
else
  echo ${ARLAS_TAB_NAME}  "is used as tab name "
fi
envsubst '$ARLAS_TAB_NAME' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Enabling CSV export of resultlist
if [ -z "${RESULTLIST_ENABLE_EXPORT}" ]; then
  RESULTLIST_ENABLE_EXPORT=false
  export RESULTLIST_ENABLE_EXPORT
  echo "No RESULTLIST_ENABLE_EXPORT is specified. Defaults to false"
else
  echo "Enabling CSV export of resultlist:" ${RESULTLIST_ENABLE_EXPORT}
fi
envsubst '$RESULTLIST_ENABLE_EXPORT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Size of resultlist's CSV export
if [ -z "${RESULTLIST_EXPORT_SIZE}" ]; then
  RESULTLIST_EXPORT_SIZE=1000
  export RESULTLIST_EXPORT_SIZE
  echo "No RESULTLIST_EXPORT_SIZE is specified. Defaults to 1000"
else
  echo "Resultlist's CSV export size:" ${RESULTLIST_EXPORT_SIZE}
fi
envsubst '$RESULTLIST_EXPORT_SIZE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Set histograms max buckets
if [ -z "${ARLAS_HISTOGRAMS_MAX_BUCKETS}" ]; then
  ARLAS_HISTOGRAMS_MAX_BUCKETS=200
  export ARLAS_HISTOGRAMS_MAX_BUCKETS
  echo "No ARLAS_HISTOGRAMS_MAX_BUCKETS is specified. Defaults to 200"
else
  echo ${ARLAS_HISTOGRAMS_MAX_BUCKETS}  "is used as histograms maximum number of buckets "
fi
envsubst '$ARLAS_HISTOGRAMS_MAX_BUCKETS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml


# Set histograms max buckets at CSV export
if [ -z "${ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS}" ]; then
  ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS=1000
  export ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS
  echo "No ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS is specified. Defaults to 1000"
else
  echo ${ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS}  "is used as histograms maximum nuber of buckets at CSV export"
fi
envsubst '$ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

## Download
# Process settings URL
if [ -z "${ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL}" ]; then
  ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL='assets/processes/download.json'
  export ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL
  echo "No ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL is specified. Defaults to 'assets/processes/download.json'"
else
  echo ${ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL}  "is used as a path to settings description of the download process inputs."
fi
envsubst '$ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process URL
if [ -z "${ARLAS_DOWNLOAD_PROCESS_URL}" ]; then
  ARLAS_DOWNLOAD_PROCESS_URL=NOT_CONFIGURED
  export ARLAS_DOWNLOAD_PROCESS_URL
  echo "No ARLAS_DOWNLOAD_PROCESS_URL is specified."
else
  echo ${ARLAS_DOWNLOAD_PROCESS_URL}  "is used as a backend endpoint to execute the download process."
fi
envsubst '$ARLAS_DOWNLOAD_PROCESS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process CHECK URL
if [ -z "${ARLAS_DOWNLOAD_PROCESS_CHECK_URL}" ]; then
  ARLAS_DOWNLOAD_PROCESS_CHECK_URL=NOT_CONFIGURED
  export ARLAS_DOWNLOAD_PROCESS_CHECK_URL
  echo "No ARLAS_DOWNLOAD_PROCESS_CHECK_URL is specified."
else
  echo ${ARLAS_DOWNLOAD_PROCESS_CHECK_URL}  "is used as a backend endpoint to check the download process availability."
fi
envsubst '$ARLAS_DOWNLOAD_PROCESS_CHECK_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process Status URL
if [ -z "${ARLAS_DOWNLOAD_PROCESS_STATUS_URL}" ]; then
  ARLAS_DOWNLOAD_PROCESS_STATUS_URL=NOT_CONFIGURED
  export ARLAS_DOWNLOAD_PROCESS_STATUS_URL
  echo "No ARLAS_DOWNLOAD_PROCESS_STATUS_URL is specified."
else
  echo ${ARLAS_DOWNLOAD_PROCESS_STATUS_URL}  "is used as a backend endpoint to check the status of the download process."
fi
envsubst '$ARLAS_DOWNLOAD_PROCESS_STATUS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process maximum number of items allowed
if [ -z "${ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS}" ]; then
  ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS=100
  export ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS
  echo "No ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS is specified."
else
  echo ${ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS}  "is used for the download process max items."
fi
envsubst '$ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

## Enrich
# Process settings URL
if [ -z "${ARLAS_ENRICH_PROCESS_SETTINGS_URL}" ]; then
  ARLAS_ENRICH_PROCESS_SETTINGS_URL='assets/processes/enrich.json'
  export ARLAS_ENRICH_PROCESS_SETTINGS_URL
  echo "No ARLAS_ENRICH_PROCESS_SETTINGS_URL is specified. Defaults to 'assets/processes/download.json'"
else
  echo ${ARLAS_ENRICH_PROCESS_SETTINGS_URL}  "is used as a path to settings description of the enrich process inputs."
fi
envsubst '$ARLAS_ENRICH_PROCESS_SETTINGS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process URL
if [ -z "${ARLAS_ENRICH_PROCESS_URL}" ]; then
  ARLAS_ENRICH_PROCESS_URL=NOT_CONFIGURED
  export ARLAS_ENRICH_PROCESS_URL
  echo "No ARLAS_ENRICH_PROCESS_URL is specified."
else
  echo ${ARLAS_ENRICH_PROCESS_URL}  "is used as a backend endpoint to execute the enrich process."
fi
envsubst '$ARLAS_ENRICH_PROCESS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process CHECK URL
if [ -z "${ARLAS_ENRICH_PROCESS_CHECK_URL}" ]; then
  ARLAS_ENRICH_PROCESS_CHECK_URL=NOT_CONFIGURED
  export ARLAS_ENRICH_PROCESS_CHECK_URL
  echo "No ARLAS_ENRICH_PROCESS_CHECK_URL is specified."
else
  echo ${ARLAS_ENRICH_PROCESS_CHECK_URL}  "is used as a backend endpoint to check the enrich process availability."
fi
envsubst '$ARLAS_ENRICH_PROCESS_CHECK_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process Status URL
if [ -z "${ARLAS_ENRICH_PROCESS_STATUS_URL}" ]; then
  ARLAS_ENRICH_PROCESS_STATUS_URL=NOT_CONFIGURED
  export ARLAS_ENRICH_PROCESS_STATUS_URL
  echo "No ARLAS_ENRICH_PROCESS_STATUS_URL is specified."
else
  echo ${ARLAS_ENRICH_PROCESS_STATUS_URL}  "is used as a backend endpoint to check the status of the enrich process."
fi
envsubst '$ARLAS_ENRICH_PROCESS_STATUS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Process maximum number of items allowed
if [ -z "${ARLAS_ENRICH_PROCESS_MAX_ITEMS}" ]; then
  ARLAS_ENRICH_PROCESS_MAX_ITEMS=100
  export ARLAS_ENRICH_PROCESS_MAX_ITEMS
  echo "No ARLAS_ENRICH_PROCESS_MAX_ITEMS is specified."
else
  echo ${ARLAS_ENRICH_PROCESS_MAX_ITEMS}  "is used for the enrich process max items."
fi
envsubst '$ARLAS_ENRICH_PROCESS_MAX_ITEMS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml



# Set App base path
if [ -z "${ARLAS_WUI_APP_PATH}" ]; then
  ARLAS_WUI_APP_PATH=""
  export ARLAS_WUI_APP_PATH
  echo "No specific path for the app"
else
  echo ${ARLAS_WUI_APP_PATH}  "is used as app base path "
fi

# Set App base href
if [ -z "${ARLAS_WUI_BASE_HREF}" ]; then
  ARLAS_WUI_BASE_HREF=""
  export ARLAS_WUI_BASE_HREF
  echo "No specific base href for the app"
else
  echo ${ARLAS_WUI_BASE_HREF}  "is used as app base href "
fi


## PERSISTENCE
if [ -z "${ARLAS_PERSISTENCE_URL}" ]; then
  ARLAS_PERSISTENCE_URL=NOT_CONFIGURED
  export ARLAS_PERSISTENCE_URL
  echo "NO ARLAS-persistence URL is specified. ARLAS-wui will load its own config.json file"
else
  echo ${ARLAS_PERSISTENCE_URL} "is used for 'persistence.url'"
fi

## AUTHENTICATION
### ARLAS_USE_AUTHENT
if [ -z "${ARLAS_USE_AUTHENT}" ]; then
  ARLAS_USE_AUTHENT=false
  export ARLAS_USE_AUTHENT
  echo "No Authentication variable is set"
else
  echo ${ARLAS_USE_AUTHENT} "is used for 'authentication.use_authent'. Default value is 'false'"
fi
envsubst '$ARLAS_USE_AUTHENT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_USE_AUTHENT
if [ -z "${ARLAS_AUTHENT_FORCE_CONNECT}" ]; then
  ARLAS_AUTHENT_FORCE_CONNECT=false
  export ARLAS_AUTHENT_FORCE_CONNECT
  echo "No Authentication force_connect variable is set"
else
  echo ${ARLAS_AUTHENT_FORCE_CONNECT} "is used for 'authentication.force_connect'. Default value is 'false'"
fi
envsubst '$ARLAS_AUTHENT_FORCE_CONNECT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_USE_DISCOVERY
if [ -z "${ARLAS_AUTHENT_USE_DISCOVERY}" ]; then
  ARLAS_AUTHENT_USE_DISCOVERY=false
  export ARLAS_AUTHENT_USE_DISCOVERY
  echo "No Authentication discovery variable is set"
else
  echo ${ARLAS_AUTHENT_USE_DISCOVERY} "is used for 'authentication.use_discovery'. Default value is 'false'"
fi
envsubst '$ARLAS_AUTHENT_USE_DISCOVERY' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_ISSUER
if [ -z "${ARLAS_AUTHENT_ISSUER}" ]; then
  ARLAS_AUTHENT_ISSUER=NOT_CONFIGURED
  export ARLAS_AUTHENT_ISSUER
  echo "No Authentication issuer variable is set"
else
  echo ${ARLAS_AUTHENT_ISSUER} "is used for 'authentication.issuer'"
fi
envsubst '$ARLAS_AUTHENT_ISSUER' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CLIENT_ID
if [ -z "${ARLAS_AUTHENT_CLIENT_ID}" ]; then
  ARLAS_AUTHENT_CLIENT_ID=NOT_CONFIGURED
  export ARLAS_AUTHENT_CLIENT_ID
  echo "No Authentication client_id variable is set"
else
  echo ${ARLAS_AUTHENT_CLIENT_ID} "is used for 'authentication.client_id'"
fi
envsubst '$ARLAS_AUTHENT_CLIENT_ID' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_REDIRECT_URI
if [ -z "${ARLAS_AUTHENT_REDIRECT_URI}" ]; then
  ARLAS_AUTHENT_REDIRECT_URI=NOT_CONFIGURED
  export ARLAS_AUTHENT_REDIRECT_URI
  echo "No Authentication redirect_uri variable is set"
else
  echo ${ARLAS_AUTHENT_REDIRECT_URI} "is used for 'authentication.redirect_uri'"
fi
envsubst '$ARLAS_AUTHENT_REDIRECT_URI' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI
if [ -z "${ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI}" ]; then
  ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI=NOT_CONFIGURED
  export ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI
  echo "No Authentication silent_refresh_redirect_uri variable is set"
else
  echo ${ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI} "is used for 'authentication.silent_refresh_redirect_uri'"
fi
envsubst '$ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SCOPE
if [ -z "${ARLAS_AUTHENT_SCOPE}" ]; then
  ARLAS_AUTHENT_SCOPE="NOT_CONFIGURED"
  export ARLAS_AUTHENT_SCOPE
  echo "No Authentication scope variable is set"
else
  echo ${ARLAS_AUTHENT_SCOPE} "is used for 'authentication.scope'"
fi
envsubst '$ARLAS_AUTHENT_SCOPE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_TOKEN_ENDPOINT
if [ -z "${ARLAS_AUTHENT_TOKEN_ENDPOINT}" ]; then
  ARLAS_AUTHENT_TOKEN_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_TOKEN_ENDPOINT
  echo "No Authentication token_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_TOKEN_ENDPOINT} "is used for 'authentication.token_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_TOKEN_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_USERINFO_ENDPOINT
if [ -z "${ARLAS_AUTHENT_USERINFO_ENDPOINT}" ]; then
  ARLAS_AUTHENT_USERINFO_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_USERINFO_ENDPOINT
  echo "No Authentication userinfo_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_USERINFO_ENDPOINT} "is used for 'authentication.userinfo_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_USERINFO_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_JWKS_ENDPOINT
if [ -z "${ARLAS_AUTHENT_JWKS_ENDPOINT}" ]; then
  ARLAS_AUTHENT_JWKS_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_JWKS_ENDPOINT
  echo "No Authentication jwks_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_JWKS_ENDPOINT} "is used for 'authentication.jwks_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_JWKS_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_LOGIN_URL
if [ -z "${ARLAS_AUTHENT_LOGIN_URL}" ]; then
  ARLAS_AUTHENT_LOGIN_URL="NOT_CONFIGURED"
  export ARLAS_AUTHENT_LOGIN_URL
  echo "No Authentication login_url variable is set"
else
  echo ${ARLAS_AUTHENT_LOGIN_URL} "is used for 'authentication.login_url'"
fi
envsubst '$ARLAS_AUTHENT_LOGIN_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_LOGOUT_URL
if [ -z "${ARLAS_AUTHENT_LOGOUT_URL}" ]; then
  ARLAS_AUTHENT_LOGOUT_URL="NOT_CONFIGURED"
  export ARLAS_AUTHENT_LOGOUT_URL
  echo "No Authentication logout_url variable is set"
else
  echo ${ARLAS_AUTHENT_LOGOUT_URL} "is used for 'authentication.logout_url'"
fi
envsubst '$ARLAS_AUTHENT_LOGOUT_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SHOW_DEBUG
if [ -z "${ARLAS_AUTHENT_SHOW_DEBUG}" ]; then
  ARLAS_AUTHENT_SHOW_DEBUG=false
  export ARLAS_AUTHENT_SHOW_DEBUG
  echo "No Authentication show_debug_information variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_SHOW_DEBUG} "is used for 'authentication.show_debug_information'"
fi
envsubst '$ARLAS_AUTHENT_SHOW_DEBUG' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_REQUIRE_HTTPS
if [ -z "${ARLAS_AUTHENT_REQUIRE_HTTPS}" ]; then
  ARLAS_AUTHENT_REQUIRE_HTTPS=true
  export ARLAS_AUTHENT_REQUIRE_HTTPS
  echo "No Authentication require_https variable is set. Default value is 'true'"
else
  echo ${ARLAS_AUTHENT_REQUIRE_HTTPS} "is used for 'authentication.require_https'"
fi
envsubst '$ARLAS_AUTHENT_REQUIRE_HTTPS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_RESPONSE_TYPE
if [ -z "${ARLAS_AUTHENT_RESPONSE_TYPE}" ]; then
  ARLAS_AUTHENT_RESPONSE_TYPE="NOT_CONFIGURED"
  export ARLAS_AUTHENT_RESPONSE_TYPE
  echo "No Authentication response_type variable is set."
else
  echo ${ARLAS_AUTHENT_RESPONSE_TYPE} "is used for 'authentication.response_type'"
fi
envsubst '$ARLAS_AUTHENT_RESPONSE_TYPE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT
if [ -z "${ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT}" ]; then
  ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT=5000
  export ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT
  echo "No Authentication silent_refresh_timeout variable is set. Default value is 5000."
else
  echo ${ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT} "is used for 'authentication.silent_refresh_timeout'"
fi
envsubst '$ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_TIMEOUT_FACTOR
if [ -z "${ARLAS_AUTHENT_TIMEOUT_FACTOR}" ]; then
  ARLAS_AUTHENT_TIMEOUT_FACTOR=0.75
  export ARLAS_AUTHENT_TIMEOUT_FACTOR
  echo "No Authentication timeout_factor variable is set. Default value is 0.75"
else
  echo ${ARLAS_AUTHENT_TIMEOUT_FACTOR} "is used for 'authentication.timeout_factor'"
fi
envsubst '$ARLAS_AUTHENT_TIMEOUT_FACTOR' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_ENABLE_SESSION_CHECKS
if [ -z "${ARLAS_AUTHENT_ENABLE_SESSION_CHECKS}" ]; then
  ARLAS_AUTHENT_ENABLE_SESSION_CHECKS=true
  export ARLAS_AUTHENT_ENABLE_SESSION_CHECKS
  echo "No Authentication session_checks_enabled variable is set. Default value is 'true'"
else
  echo ${ARLAS_AUTHENT_ENABLE_SESSION_CHECKS} "is used for 'authentication.session_checks_enabled'"
fi
envsubst '$ARLAS_AUTHENT_ENABLE_SESSION_CHECKS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CLEAR_HASH
if [ -z "${ARLAS_AUTHENT_CLEAR_HASH}" ]; then
  ARLAS_AUTHENT_CLEAR_HASH=false
  export ARLAS_AUTHENT_CLEAR_HASH
  echo "No Authentication clear_hash_after_login variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_CLEAR_HASH} "is used for 'authentication.clear_hash_after_login'"
fi
envsubst '$ARLAS_AUTHENT_CLEAR_HASH' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_STORAGE
if [ -z "${ARLAS_AUTHENT_STORAGE}" ]; then
  ARLAS_AUTHENT_STORAGE=localstorage
  export ARLAS_AUTHENT_STORAGE
  echo "No Authentication storage variable is set. Default value is 'localstorage'"
else
  echo ${ARLAS_AUTHENT_STORAGE} "is used for 'authentication.storage'"
fi
envsubst '$ARLAS_AUTHENT_STORAGE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK
if [ -z "${ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK}" ]; then
  ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK=false
  export ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK
  echo "No Authentication disable_at_hash_check variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK} "is used for 'authentication.disable_at_hash_check'"
fi
envsubst '$ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_DUMMY_CLIENT_SECRET
if [ -z "${ARLAS_AUTHENT_DUMMY_CLIENT_SECRET}" ]; then
  ARLAS_AUTHENT_DUMMY_CLIENT_SECRET=NOT_CONFIGURED
  export ARLAS_AUTHENT_DUMMY_CLIENT_SECRET
  echo "No Authentication dummy_client_secret variable is set. Default value is NOT_CONFIGURED"
else
  echo ${ARLAS_AUTHENT_DUMMY_CLIENT_SECRET} "is used for 'authentication.dummy_client_secret'"
fi
envsubst '$ARLAS_AUTHENT_DUMMY_CLIENT_SECRET' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS
if [ -z "${ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS}" ]; then
  ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS="[]"
  export ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS
  echo "None Authentication custom query params is defined"
else
  echo ${ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS} "is used for 'authentication.custom_query_params' in settings.yaml file"
fi
envsubst '$ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_MODE
if [ -z "${ARLAS_AUTHENT_MODE}" ]; then
  ARLAS_AUTHENT_MODE='iam'
  export ARLAS_AUTHENT_MODE
  echo "Default auth.mod: 'iam' "
else
  echo ${ARLAS_AUTHENT_MODE} "is used for 'authentication.auth_mode'. Default value is 'iam'"
fi
envsubst '$ARLAS_AUTHENT_MODE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### THRESHOLD
if [ -z "${ARLAS_AUTHENT_THRESHOLD}" ]; then
  ARLAS_AUTHENT_THRESHOLD=60000
  export ARLAS_AUTHENT_THRESHOLD
  echo "Default threshold: 60000"
else
  echo ${ARLAS_AUTHENT_THRESHOLD} "is used for 'authentication.threshold'. Default value is '60000'"
fi
envsubst '$ARLAS_AUTHENT_THRESHOLD' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_IAM_SERVER_URL
if [ -z "${ARLAS_IAM_SERVER_URL}" ]; then
  ARLAS_IAM_SERVER_URL="http://localhost:9997"
  export ARLAS_IAM_SERVER_URL
  echo "Default url : http://localhost:9997"
else
  echo ${ARLAS_IAM_SERVER_URL} "is used for 'authentication.url'."
fi
envsubst '$ARLAS_IAM_SERVER_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml


### ARLAS_AUTHENT_SIGN_UP_ENABLED
if [ -z "${ARLAS_AUTHENT_SIGN_UP_ENABLED}" ]; then
  ARLAS_AUTHENT_SIGN_UP_ENABLED=false
  export ARLAS_AUTHENT_SIGN_UP_ENABLED
  echo "No Authentication sign_up_enabled variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_SIGN_UP_ENABLED} "is used for 'authentication.sign_up_enabled'"
fi
envsubst '$ARLAS_AUTHENT_SIGN_UP_ENABLED' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### Whether to show list of dashbords
if [ -z "${ARLAS_WUI_DASHBOARDS_SHORTCUT}" ]; then
  ARLAS_WUI_DASHBOARDS_SHORTCUT=false
  export ARLAS_WUI_DASHBOARDS_SHORTCUT
  echo "No dahsboard shortcut variable is set"
else
  echo ${ARLAS_WUI_DASHBOARDS_SHORTCUT} "is used for 'dashboards_shortcut'"
fi
envsubst '$ARLAS_WUI_DASHBOARDS_SHORTCUT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Whether to enable geocoding
if [ -z "${ARLAS_GEOCODING_ENABLED}" ]; then
  ARLAS_GEOCODING_ENABLED=false
  export ARLAS_GEOCODING_ENABLED
  echo "Geocoding is disabled"
else
  echo "Geocoing is enabled: " ${ARLAS_GEOCODING_ENABLED}
fi
envsubst '$ARLAS_GEOCODING_ENABLED' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Set geocoding url
if [ -z "${ARLAS_GEOCODING_FIND_PLACE_URL}" ]; then
  ARLAS_GEOCODING_FIND_PLACE_URL=NOT_CONFIGURED
  export ARLAS_GEOCODING_FIND_PLACE_URL
  echo "No url defined for geocoding"
else
  echo ${ARLAS_GEOCODING_FIND_PLACE_URL}  "is used as url for geocoding "
fi
envsubst '$ARLAS_GEOCODING_FIND_PLACE_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Set zoom for point
if [ -z "${ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO}" ]; then
  ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO=11
  export ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO
  echo ${ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO} "is used as default geocoding zoom"
else
  echo ${ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO}  "is used as geocoding zoom"
fi
envsubst '$ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### Array of statics links
if [ -z "${ARLAS_STATIC_LINKS}" ]; then
  ARLAS_STATIC_LINKS="[]"
  export ARLAS_STATIC_LINKS
  echo "None static link is defined"
else
  echo ${ARLAS_STATIC_LINKS} "is used for 'links' in settings.yaml file"
fi
envsubst '$ARLAS_STATIC_LINKS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_HUB_URL
if [ -z "${ARLAS_HUB_URL}" ]; then
  ARLAS_HUB_URL="http://localhost:8095"
  export ARLAS_HUB_URL
  echo "Default arlas_hub_url : http://localhost:8095"
else
  echo ${ARLAS_HUB_URL} "is used for managing configurations"
fi
envsubst '$ARLAS_HUB_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

envsubst '$ARLAS_GOOGLE_ANALYTICS_KEY' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

envsubst '$ARLAS_TICKETING_KEY' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html


envsubst '$ARLAS_WUI_BASE_HREF' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

envsubst '$ARLAS_WUI_APP_PATH' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

envsubst '$ARLAS_PERSISTENCE_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

envsubst '$ARLAS_TICKETING_KEY' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

nginx -g "daemon off;"

#!/bin/sh
set -o errexit -o pipefail

# Set the default value for an environment variable if not already set
set_default_env_variable() {
    VARIABLE_NAME=$1
    VARIABLE_VALUE=$2
    CURRENT_VALUE=$(eval "echo \$$VARIABLE_NAME")
    if [ -z "$CURRENT_VALUE" ]; then
        eval "$VARIABLE_NAME=\"$VARIABLE_VALUE\""
        export "$VARIABLE_NAME"
        echo "Set $VARIABLE_NAME to '$(eval "echo \$$VARIABLE_NAME")'."
    else
        echo "$VARIABLE_NAME is already set to '$CURRENT_VALUE', not overriding."
    fi
}

# Initialize environment variables using set_default_env_variable
set_default_env_variable ARLAS_SERVER_URL "http://demo.arlas.io/arlas/"
set_default_env_variable ARLAS_SERVER_COLLECTION "foobar"
set_default_env_variable ARLAS_TAGGER_URL "http://localhost:9998"
set_default_env_variable ARLAS_MAP_STYLE "http://demo.arlas.io:82/styles/positron/style.json"
set_default_env_variable ARLAS_GOOGLE_ANALYTICS_KEY "XX-XXXXXXXXX-X"
set_default_env_variable ARLAS_TICKETING_KEY "NOT_CONFIGURED"
set_default_env_variable ARLAS_TAB_NAME "NOT_CONFIGURED"

set_default_env_variable RESULTLIST_ENABLE_EXPORT "false"
set_default_env_variable RESULTLIST_EXPORT_SIZE "1000"

set_default_env_variable ARLAS_HISTOGRAMS_MAX_BUCKETS "200"
set_default_env_variable ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS "1000"

set_default_env_variable ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL "assets/processes/download.json"
set_default_env_variable ARLAS_DOWNLOAD_PROCESS_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_DOWNLOAD_PROCESS_CHECK_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_DOWNLOAD_PROCESS_STATUS_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS "100"

set_default_env_variable ARLAS_ENRICH_PROCESS_SETTINGS_URL "assets/processes/enrich.json"
set_default_env_variable ARLAS_ENRICH_PROCESS_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_ENRICH_PROCESS_CHECK_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_ENRICH_PROCESS_STATUS_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_ENRICH_PROCESS_MAX_ITEMS "100"

set_default_env_variable ARLAS_WUI_APP_PATH ""
set_default_env_variable ARLAS_WUI_BASE_HREF ""

set_default_env_variable ARLAS_PERSISTENCE_URL "NOT_CONFIGURED"

set_default_env_variable ARLAS_USE_AUTHENT "false"
set_default_env_variable ARLAS_AUTHENT_FORCE_CONNECT "false"
set_default_env_variable ARLAS_AUTHENT_USE_DISCOVERY "false"
set_default_env_variable ARLAS_AUTHENT_ISSUER "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_CLIENT_ID "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_REDIRECT_URI "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SCOPE "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_TOKEN_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_USERINFO_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_JWKS_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_LOGIN_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_LOGOUT_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SHOW_DEBUG "false"
set_default_env_variable ARLAS_AUTHENT_REQUIRE_HTTPS "true"
set_default_env_variable ARLAS_AUTHENT_RESPONSE_TYPE "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT "5000"
set_default_env_variable ARLAS_AUTHENT_TIMEOUT_FACTOR "0.75"
set_default_env_variable ARLAS_AUTHENT_ENABLE_SESSION_CHECKS "true"
set_default_env_variable ARLAS_AUTHENT_CLEAR_HASH "false"
set_default_env_variable ARLAS_AUTHENT_STORAGE "localstorage"
set_default_env_variable ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK "false"
set_default_env_variable ARLAS_AUTHENT_DUMMY_CLIENT_SECRET "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS "[]"
set_default_env_variable ARLAS_AUTHENT_MODE "iam"
set_default_env_variable ARLAS_AUTHENT_THRESHOLD "60000"
set_default_env_variable ARLAS_IAM_SERVER_URL "http://localhost:9997"
set_default_env_variable ARLAS_AUTHENT_SIGN_UP_ENABLED "false"

set_default_env_variable ARLAS_WUI_DASHBOARDS_SHORTCUT "false"

set_default_env_variable ARLAS_GEOCODING_ENABLED "false"
set_default_env_variable ARLAS_GEOCODING_FIND_PLACE_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO "11"

set_default_env_variable ARLAS_STATIC_LINKS "[]"
set_default_env_variable ARLAS_HUB_URL "http://localhost:8095"

# All variables that need to be substituted in settings.yaml
SETTINGS_VARS="ARLAS_SERVER_URL ARLAS_SERVER_COLLECTION ARLAS_TAGGER_URL ARLAS_MAP_STYLE ARLAS_GOOGLE_ANALYTICS_KEY ARLAS_TICKETING_KEY ARLAS_TAB_NAME RESULTLIST_ENABLE_EXPORT RESULTLIST_EXPORT_SIZE ARLAS_HISTOGRAMS_MAX_BUCKETS ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL ARLAS_DOWNLOAD_PROCESS_URL ARLAS_DOWNLOAD_PROCESS_CHECK_URL ARLAS_DOWNLOAD_PROCESS_STATUS_URL ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS ARLAS_ENRICH_PROCESS_SETTINGS_URL ARLAS_ENRICH_PROCESS_URL ARLAS_ENRICH_PROCESS_CHECK_URL ARLAS_ENRICH_PROCESS_STATUS_URL ARLAS_ENRICH_PROCESS_MAX_ITEMS ARLAS_WUI_BASE_HREF ARLAS_PERSISTENCE_URL ARLAS_USE_AUTHENT ARLAS_AUTHENT_FORCE_CONNECT ARLAS_AUTHENT_USE_DISCOVERY ARLAS_AUTHENT_ISSUER ARLAS_AUTHENT_CLIENT_ID ARLAS_AUTHENT_REDIRECT_URI ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI ARLAS_AUTHENT_SCOPE ARLAS_AUTHENT_TOKEN_ENDPOINT ARLAS_AUTHENT_USERINFO_ENDPOINT ARLAS_AUTHENT_JWKS_ENDPOINT ARLAS_AUTHENT_LOGIN_URL ARLAS_AUTHENT_LOGOUT_URL ARLAS_AUTHENT_SHOW_DEBUG ARLAS_AUTHENT_REQUIRE_HTTPS ARLAS_AUTHENT_RESPONSE_TYPE ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT ARLAS_AUTHENT_TIMEOUT_FACTOR ARLAS_AUTHENT_ENABLE_SESSION_CHECKS ARLAS_AUTHENT_CLEAR_HASH ARLAS_AUTHENT_STORAGE ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK ARLAS_AUTHENT_DUMMY_CLIENT_SECRET ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS ARLAS_AUTHENT_MODE ARLAS_AUTHENT_THRESHOLD ARLAS_IAM_SERVER_URL ARLAS_AUTHENT_SIGN_UP_ENABLED ARLAS_WUI_DASHBOARDS_SHORTCUT ARLAS_GEOCODING_ENABLED ARLAS_GEOCODING_FIND_PLACE_URL ARLAS_GEOCODING_FIND_PLACE_ZOOM_TO ARLAS_STATIC_LINKS ARLAS_HUB_URL ARLAS_TICKETING_KEY"

SETTINGS_SUBST=$(printf '$%s ' $SETTINGS_VARS)
envsubst "$SETTINGS_SUBST" < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
truncate -s 0 /usr/share/nginx/html/settings.yaml
cat /usr/share/nginx/html/settings.yaml.tmp >> /usr/share/nginx/html/settings.yaml

# Variables to substitute in index.html
INDEX_VARS="ARLAS_GOOGLE_ANALYTICS_KEY ARLAS_TICKETING_KEY ARLAS_WUI_BASE_HREF"

INDEX_SUBST=$(printf '$%s ' $INDEX_VARS)
envsubst "$INDEX_SUBST" < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
cat /usr/share/nginx/html/index.html.tmp > /usr/share/nginx/html/index.html

# Variables to substitute in nginx default.conf
NGINX_VARS="ARLAS_WUI_APP_PATH"

NGINX_SUBST=$(printf '$%s ' $NGINX_VARS)
envsubst "$NGINX_SUBST" < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
cat /etc/nginx/conf.d/default.conf.tmp > /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"

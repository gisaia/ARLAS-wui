# Configuring ARLAS-wui running environment

## ARLAS-wui settings file

ARLAS-wui is configured with a yaml settings file that you can customize.

### Configure ARLAS-wui as a docker container

#### With environment variables

`ARLAS-wui` can run as a docker container. A rich set of properties of the settings file can be overridden by passing environment variables to the container:

```
docker run -ti -d \
   --name arlas-wui \
   gisaia/arlas-wui:latest
```

All supported environment variables are listed below.

### With file/URL based configuration

Instead of overriding some properties of the settings file, it is possible to start the `arlas-wui` container with a given settings file.

#### File

The `arlas-wui` container can start with a mounted settings file thanks to docker volume mapping. For instance, if the current directory of the host contains a `settings.yaml` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui \
   -v `pwd`/settings.yaml:/usr/share/nginx/html/settings.yaml \
   gisaia/arlas-wui:latest
```
#### URL
The `arlas-wui` container can start with a settings file that is downloaded before starting up. The settings file must be available through an URL accessible from within the container. The URL is specified with an environment variable:

| Environment variable | Description |
| -------------------- | ----------- |
|ARLAS_SETTINGS_URL | URL of the ARLAS-wui settings file to be downloaded by the container before starting |

For instance, if the current directory of the host contains a `settings.yaml` file, the container can be started as follows:

```
docker run -ti -d \
   --name arlas-wui \
   -e ARLAS_SETTINGS_URL="http://somemachine/settings.yaml" \
   gisaia/arlas-wui:latest
```
### arlas-wui settings properties

If you don't mount a `settings.yaml` file to the container, nor serve it with `ARLAS_SETTINGS_URL` variable, you can set a bunch of environment variables in the default `settings.yaml` embarked with the application.

#### Variables that are specific to ARLAS-wui

|Environment variable| settings.yaml variable|Default|Description|
|--------------------|---------------------------|-------|-----------|
|ARLAS_DOWNLOAD_PROCESS_SETTINGS_URL   | processes[].settings.url| assets/processes/download.json | URL to settings file that describes the download process inputs. |
|ARLAS_DOWNLOAD_PROCESS_URL   | processes[].url| - | URL to the backend endpoint that executes the download process. |
|ARLAS_DOWNLOAD_PROCESS_CHECK_URL | processes[].check_url | - | URL to an endpoint that enables to check if a user has the right to use the download process. |
|ARLAS_DOWNLOAD_PROCESS_STATUS_URL | processes[].status.url | - | URL to an endpoint that check the download process ongoing status. |
|ARLAS_DOWNLOAD_PROCESS_MAX_ITEMS | processes[].max_items | - | Maximum number of items that can be handled with one execution of the download process.|
|ARLAS_ENRICH_PROCESS_SETTINGS_URL   | processes[].settings.url| assets/processes/enrich.json | URL to settings file that describes the enrich process inputs. |
|ARLAS_ENRICH_PROCESS_URL   | processes[].url| - | URL to the backend endpoint that executes the enrich process. |
|ARLAS_ENRICH_PROCESS_CHECK_URL | processes[].check_url | - | URL to an endpoint that enables to check if a user has the right to use the enrich process.|
|ARLAS_ENRICH_PROCESS_STATUS_URL | processes[].status.url | - | URL to an endpoint that check the enrich process ongoing status|
|ARLAS_ENRICH_PROCESS_MAX_ITEMS | processes[].max_items | - | Maximum number of items that can be handled with one execution of the enrich process.|
|ARLAS_WUI_DASHBOARDS_SHORTCUT| dashboards_shortcut | false | Whether to display a shortcut component to switch between dashboards. To be used for dev purposes only. |

## ARLAS-wui assets

ARLAS-wui comes with several assets:

- Translation files stored in `assets/i18n/`

### Translation files

`ARLAS-wui` comes with a list of translatable keys.

Translations are edited in i18n files embarked with the application container in `/usr/share/nginx/html/assets/i18n/` folder. It could be overridden by a:

#### File

The `arlas-wui` container can start with a mounted i18n file thanks to docker volume mapping. For instance, if the current directory of the host contains a `fr.json` file, the container can be started as follows:

```
docker run -ti -d \
   --name arlas-wui \
   -v `pwd`/fr.json:/usr/share/nginx/html/assets/i18n/fr.json \
   gisaia/arlas-wui:latest
```

#### URL

Two environment variables are available to set a url to English and French translation files.

| Name                            | Description                          |
| ------------------------------- | -----------------------------------  |
| ARLAS_WUI_I18N_EN_URL	          | Url to English file to translate `arlas-wui` labels and tooltips. |
| ARLAS_WUI_I18N_FR_URL	          | Url to French file to translate `arlas-wui` labels and tooltips. |
| ARLAS_WUI_I18N_ES_URL	          | Url to Spanish file to translate `arlas-wui` labels and tooltips. |

For instance, if the current directory of the host contains a `en.json` file, the container can be started as follows:

```
docker run -ti -d \
   --name arlas-wui \
   -e ARLAS_WUI_I18N_EN_URL="http://somemachine/en.json" \
   gisaia/arlas-wui:latest
```

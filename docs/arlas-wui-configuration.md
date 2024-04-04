# Configuring ARLAS-wui running environment

## ARLAS-wui settings file

ARLAS-wui is configured with a yaml settings file that you can customize.

### Configure ARLAS-wui as a docker container

#### With environment variables

`ARLAS-wui` can run as a docker container. A rich set of properties of the settings file can be overriden by passing environment variables to the container:

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

For instance, if the current directory of the host contains a `settings.yaml` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui \
   -e ARLAS_SETTINGS_URL="http://somemachine/settings.yaml" \
   gisaia/arlas-wui:latest
```
### arlas-wui settings properties

If you don't mount a `settings.yaml` file to the container, nor serve it with `ARLAS_SETTINGS_URL` variable, you can set a bunch of environement variables in the default `settings.yaml` embarked with the application.

#### Variables that are specific to ARLAS-wui

|Environment variable| settings.yaml variable|Default|Description|
|--------------------|---------------------------|-------|-----------|
|ARLAS_PROCESS_SETTINGS_URL   | process.settings.url| assets/processes/download.json | URL to settings file that describes the Process inputs. |
|ARLAS_PROCESS_URL   | process.url| - | URL to the backend endpoint that executes the Process. |
|ARLAS_PROCESS_CHECK_URL | process.check_url | - | URL to an endpoint that enables to check if a user has the right to use the precess.|
|ARLAS_PROCESS_STATUS_URL | process.status.url | - | URL to an endpoint that check the process on going status|
|ARLAS_PROCESS_MAX_ITEMS | process.max_items | - | Maximum number of items that can be handled with one execution of the process.|
|ARLAS_WUI_DASHBOARDS_SHORTCUT| dashboards_shortcut | false | Whether to display a shortcut component to switch between dashboards. To be used for dev purposes only. |

## ARLAS-wui assets

ARLAS-wui comes with several assets:

- Translation files stored in `assets/i18n/`

### Translation files

`ARLAS-wui` comes with a list of translatable keys.

Translations are edited in i18n files embarked with the application container in `/usr/share/nginx/html/assets/i18n/` folder. It could be overriden by a:

#### File

The `arlas-wui` container can start with a mounted i18n file thanks to docker volume mapping. For instance, if the current directory of the host contains a `fr.json` file, the container can be started as follow:

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

For instance, if the current directory of the host contains a `en.json` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui \
   -e ARLAS_WUI_I18N_EN_URL="http://somemachine/en.json" \
   gisaia/arlas-wui:latest
```

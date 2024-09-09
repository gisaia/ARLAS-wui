### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:16.19.0 as builder

COPY ./package.json  ./
COPY ./package-lock.json  ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN export NODE_OPTIONS=--max_old_space_size=8192 && npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app

COPY ./scripts/start.sh ./ng-app
COPY ./scripts/fetch-conf-by-http.sh ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN export NODE_OPTIONS=--max_old_space_size=8192 && $(npm bin)/ng build --configuration production --aot --base-href='$ARLAS_WUI_BASE_HREF/'

### STAGE 2: Setup ###

FROM nginx:1.25.3-alpine3.18-slim
ARG version="latest"

LABEL io.arlas.wui.version=${version}
LABEL vendor="Gisaïa"
LABEL description="This container build and serve the ARLAS-wui app"

RUN apk add --update bash jq netcat-openbsd curl && rm -rf /var/cache/apk/*

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html
COPY --from=builder /ng-app/start.sh /usr/share/nginx/
COPY --from=builder /ng-app/fetch-conf-by-http.sh /usr/share/nginx/

HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1

CMD /usr/share/nginx/start.sh

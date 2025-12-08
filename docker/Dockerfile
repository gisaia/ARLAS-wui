
### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:18.20.8-slim AS builder
ARG WORKSPACE

RUN mkdir /ng-app
WORKDIR /ng-app

COPY packages/$WORKSPACE ./packages/$WORKSPACE/
COPY package.json .
COPY package-lock.json .
COPY ./src/ ./src/
COPY angular.json .
COPY tsconfig.json .
COPY ./patches/ ./patches/

# If package != opensource, remove src/assets/basemap
RUN if [ "${WORKSPACE}" != "opensource" ]; then rm -rf ./src/assets/basemap; fi

RUN npm install --ignore-scripts --workspace="packages/$WORKSPACE" --include-workspace-root=true && npm run postinstall
## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run "build-$WORKSPACE"

### STAGE 2: Setup ###

FROM nginx:1.29-alpine3.22-slim
ARG version="latest"

LABEL io.arlas.wui.version=${version}
LABEL vendor="Gisaïa"
LABEL description="This container build and serve the ARLAS-wui app"

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/
COPY nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## Copy the custom start script
COPY ./scripts/start.sh /usr/share/nginx/

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

## Fix permissions for template filling at container startup
## Nginx user must be able to set variables in these files
RUN touch /usr/share/nginx/html/settings.yaml.tmp && \
    touch /etc/nginx/conf.d/default.conf.tmp && \
    touch /usr/share/nginx/html/index.html.tmp &&  \
    chmod 666 /usr/share/nginx/html/settings.yaml.tmp \
        /usr/share/nginx/html/settings.yaml \
        /etc/nginx/conf.d/default.conf.tmp \
        /etc/nginx/conf.d/default.conf \
        /usr/share/nginx/html/index.html.tmp \
        /usr/share/nginx/html/index.html

USER nginx

HEALTHCHECK CMD wget -O /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["/usr/share/nginx/start.sh"]
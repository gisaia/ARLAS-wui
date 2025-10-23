
### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:18.20.5 AS builder
ARG WORKSPACE

RUN mkdir /ng-app
WORKDIR /ng-app

COPY packages/$WORKSPACE ./packages/$WORKSPACE/
COPY package.json .
COPY package-lock.json .
COPY ./src/ ./src/
COPY angular.json .
COPY tsconfig.json .

RUN npm install --ignore-scripts --workspace=packages/$WORKSPACE --include-workspace-root=true && npm run postinstall
## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run build-$WORKSPACE

### STAGE 2: Setup ###

FROM nginx:1.28.0-alpine3.21-slim
ARG version="latest"
RUN chown -R nginx /etc/nginx
RUN chown -R nginx /usr/share/nginx/html
USER nginx

LABEL io.arlas.wui.version=${version}
LABEL vendor="Gisaïa"
LABEL description="This container build and serve the ARLAS-wui app"

## Copy our default nginx config
COPY --chown=nginx nginx/default.conf /etc/nginx/conf.d/
COPY --chown=nginx  nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY --chown=nginx ./scripts/start.sh /usr/share/nginx/

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder --chown=nginx /ng-app/dist /usr/share/nginx/html

HEALTHCHECK CMD wget -O /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["/usr/share/nginx/start.sh"]

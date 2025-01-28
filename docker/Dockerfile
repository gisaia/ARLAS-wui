
### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:18.20.5 AS builder
ARG WORKSPACE

RUN  mkdir /ng-app
WORKDIR /ng-app

COPY packages/$WORKSPACE /ng-app/packages/$WORKSPACE/
COPY package.json /ng-app/
COPY package-lock.json /ng-app/
COPY ./src/ ./src/
COPY ./scripts/start.sh .
COPY angular.json .
COPY tsconfig.json .

RUN npm install --workspace=packages/$WORKSPACE --include-workspace-root=true
## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run build-$WORKSPACE

### STAGE 2: Setup ###

FROM nginx:1.25.3-alpine3.18-slim
ARG version="latest"
RUN chown -R nginx /etc/nginx;
RUN chown -R nginx /usr/share/nginx/html
USER nginx

LABEL io.arlas.wui.version=${version}
LABEL vendor="Gisaïa"
LABEL description="This container build and serve the ARLAS-wui app"

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/
COPY nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html
COPY --from=builder /ng-app/start.sh /usr/share/nginx/

HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1

CMD /usr/share/nginx/start.sh

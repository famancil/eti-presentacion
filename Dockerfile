FROM node:11.15.0-alpine as build-step
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.16.0-alpine as prod-stage

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-step /app/dist/ng7-angular /usr/share/nginx/html

COPY dev/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

RUN echo "mainFileName=\"\$(ls /usr/share/nginx/html/main*.js)\" && \
          envsubst '\$BACKEND_API_URL \$PROXYDTE_URL ' < \${mainFileName} > main.tmp && \
          mv main.tmp \${mainFileName} && nginx -g 'daemon off;'" > run.sh

##CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/settings.template.json > /usr/share/nginx/html/assets/settings.json && exec nginx -g 'daemon off;'"]

ENTRYPOINT ["sh", "run.sh"]

# Set TimeZone
ENV TZ=Etc/GMT+3
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone	
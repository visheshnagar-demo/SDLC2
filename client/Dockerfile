# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY client/package.json* client/package-lock.json* ./
RUN npm install --force

COPY client/ ./
RUN npm run build -- --configuration=production

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine

# Angular 17+ outputs to dist/<project>/browser — dist already includes assets/env.template.js
COPY --from=build /app/dist/citidirect/browser /usr/share/nginx/html

RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

# gettext provides envsubst to inject API_BASE_URL at container startup
RUN apk add --no-cache gettext

ENV API_BASE_URL=http://localhost:8080/api

# At startup: replace ${API_BASE_URL} in env.template.js → env.js, then start nginx
RUN printf '#!/bin/sh\nenvsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js\nexec nginx -g "daemon off;"\n' \
    > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]

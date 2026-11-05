# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile + manifest together for a reproducible install
COPY client/package.json* client/package-lock.json* ./
RUN npm install --force

# Copy source and build
COPY client/ ./
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# gettext provides envsubst, used at startup to inject API_BASE_URL into env.js
RUN apk add --no-cache gettext

COPY --from=build /app/dist/citidirect/browser /usr/share/nginx/html

# Configure nginx: port 8080 (Cloud Run) + SPA routing fallback
RUN printf 'server {\nlisten 8080;\nroot /usr/share/nginx/html;\nindex index.html;\nlocation / {\ntry_files $uri $uri/ /index.html;\n}\n}\n' > /etc/nginx/conf.d/default.conf

# At startup: substitute ${API_BASE_URL} in the template → env.js, then start nginx.
# API_BASE_URL is set as a Cloud Run env var on the frontend service.
# Default keeps the app functional if the var is unset (e.g. local docker run).
ENV API_BASE_URL=http://localhost:8080/api
RUN printf '#!/bin/sh\nenvsubst "${API_BASE_URL}" < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js\nexec nginx -g "daemon off;"\n' > /docker-entrypoint.sh \
    && chmod +x /docker-entrypoint.sh

EXPOSE 8080
CMD ["/docker-entrypoint.sh"]

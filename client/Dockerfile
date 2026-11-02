# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile + manifest together for a reproducible install
COPY package.json package-lock.json* ./
RUN npm install --force

# Copy source and build
COPY . ./
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist/citidirect-cash-statements/browser/ /usr/share/nginx/html/

# Store nginx config as a template; envsubst fills in $BACKEND_URL at startup
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Restrict envsubst to only replace $BACKEND_URL, preserving nginx variables
ENV NGINX_ENVSUBST_FILTER="BACKEND_URL"

# Default fallback so the container works even without BACKEND_URL set
ENV BACKEND_URL=https://scrum-476-backend-2cvsawwruq-uc.a.run.app

EXPOSE 8080
# nginx:alpine's built-in entrypoint runs envsubst on /etc/nginx/templates/*.template
CMD ["nginx", "-g", "daemon off;"]

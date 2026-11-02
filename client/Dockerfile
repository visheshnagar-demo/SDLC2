# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile + manifest together for a reproducible install
COPY client/package.json client/package-lock.json* ./
RUN npm install --force

# Copy source and build
COPY client/ ./
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist/citidirect-cash-statements/browser/ /usr/share/nginx/html/
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

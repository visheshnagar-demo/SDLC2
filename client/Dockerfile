# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile + manifest together for a reproducible install
COPY client/package.json* client/package-lock.json* ./
RUN npm install --force

# Copy source and build
COPY client/ ./
RUN npm run build -- --configuration=production

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built Angular app (Angular 17+ outputs to dist/<project>/browser)
COPY --from=build /app/dist/citidirect/browser /usr/share/nginx/html

# Simple SPA routing: fallback to index.html for all routes (same as Vite template)
RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  index index.html index.htm;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

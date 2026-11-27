# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY client/package.json* client/package-lock.json* ./
RUN npm install --force

COPY client/ ./
# VITE_API_BASE_URL is baked into the bundle at build time.
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\nlisten 8080;\nroot /usr/share/nginx/html;\nindex index.html;\nlocation / {\ntry_files $uri $uri/ /index.html;\n}\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

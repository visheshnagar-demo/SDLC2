# Multi-stage Docker build for Veritas IDV React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker caching
COPY package.json ./
RUN npm install --prefer-offline

# Copy application source
COPY . .

# Pass API URL build arg for Vite build-time inlining
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve via high-performance Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

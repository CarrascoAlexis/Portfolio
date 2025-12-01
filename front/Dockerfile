FROM node:20-bullseye-slim AS builder
ARG VITE_API_URL
WORKDIR /app

# Install dependencies (use lockfile when present for reproducible builds)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source and build. Set build-time env for Vite if provided.
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=2048
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Production stage: minimal nginx to serve static assets
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

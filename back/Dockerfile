FROM node:20-bullseye-slim AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json* ./
# Use npm ci when a lockfile is present for reproducible installs;
# otherwise fall back to a production install so the build doesn't fail.
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --production --no-audit --no-fund; \
    fi

FROM base AS runner
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]

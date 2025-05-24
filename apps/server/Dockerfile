FROM node:22.3.0-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx run-many --target=build --projects=server,run-migrations,healthcheck --configuration=production && \
    npm install --package-lock-only --prefix dist/apps/server

FROM node:22.3.0-bookworm-slim AS dependencies
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/apps/server/package*.json ./
RUN npm ci && \
    apt-get update && \
    apt-get install -y build-essential python3 && \
    npm rebuild bcrypt --build-from-source && \
    npm prune && npm cache clean --force && \
    rm -f .npmrc npm-debug.log

FROM node:22.3.0-bookworm-slim
ENV NODE_ENV=production
RUN npm install -g pm2@latest && \
    npm cache clean --force && \
    groupadd --system appgroup && \
    useradd --system --gid appgroup --create-home appuser

USER appuser
WORKDIR /usr/src/app

COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist/apps/server ./build
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist/libs/server/data-source/data-source/migrations ./migrations
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist/tools/scripts/run-migrations/index.cjs ./scripts/run-migrations/index.cjs
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist/tools/scripts/healthcheck/index.cjs ./scripts/healthcheck/index.cjs
COPY --from=dependencies --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules

ENTRYPOINT ["pm2-runtime","build/main.js","--no-daemon"]
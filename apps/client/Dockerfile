FROM node:24.22.1-alpine AS builder
WORKDIR /usr/src/app
ENV CYPRESS_INSTALL_BINARY=0
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build client --configuration=production

FROM node:24.22.1-alpine
RUN apk add --no-cache curl && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /usr/src/app
COPY --from=builder  --chown=appuser:appgroup /usr/src/app/dist/apps/client /usr/src/app/dist

CMD ["node", "dist/server/server.mjs"]
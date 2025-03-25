FROM node:22.3.0-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build client --configuration=production

FROM node:22.3.0-alpine
RUN apk add --no-cache curl && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /usr/src/app
COPY --from=builder  --chown=appuser:appgroup /usr/src/app/dist/apps/client /usr/src/app/dist

CMD ["node", "dist/server/server.mjs"]
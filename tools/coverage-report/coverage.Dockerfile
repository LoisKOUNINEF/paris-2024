FROM node:22.3.0 AS builder
WORKDIR /usr/src/app
COPY ../../ .
RUN npm ci && \
		npm run coverage-report

FROM nginx:1.21-alpine

RUN sed -i 's/listen  .*/listen 8090;/' /etc/nginx/conf.d/default.conf && \
		mkdir /usr/share/nginx/html/coverage
COPY --from=builder /usr/src/app/coverage-report/ /usr/share/nginx/html/coverage

EXPOSE 8090

CMD ["nginx", "-g", "daemon off;"]

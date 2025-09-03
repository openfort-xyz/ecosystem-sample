FROM node:20.19-alpine AS builder

RUN apk add --no-cache \
    openssl \
    python3 \
    make \
    gcc \
    g++ \
    libc-dev \
    jq

WORKDIR /app
COPY . .

RUN apk add --no-cache jq
# Install dependencies
RUN yarn install

# Build with placeholder values - actual values will be injected at runtime
ENV REACT_APP_APP_NAME=__REACT_APP_APP_NAME__
ENV REACT_APP_OPENFORT_PUBLIC_KEY=__REACT_APP_OPENFORT_PUBLIC_KEY__
ENV REACT_APP_SHIELD_PUBLIC_KEY=__REACT_APP_SHIELD_PUBLIC_KEY__
ENV REACT_APP_BACKEND_URL=__REACT_APP_BACKEND_URL__
ENV REACT_APP_OPENFORT_ECOSYSTEM_ID=__REACT_APP_OPENFORT_ECOSYSTEM_ID__

RUN yarn build

FROM nginx:1.25.4-alpine
ENV NODE_ENV=production

# Copy built app and configs
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

# Use entrypoint script to inject env vars at runtime
ENTRYPOINT ["/docker-entrypoint.sh"]
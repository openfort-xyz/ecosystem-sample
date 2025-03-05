FROM node:20.18-slim

ARG NEXT_PUBLIC_POLICY_ID
ENV NEXT_PUBLIC_POLICY_ID=$NEXT_PUBLIC_POLICY_ID

RUN apt-get update -y && apt-get install -y openssl \
    python3 \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# Install production dependencies.
RUN yarn install

# Install production dependencies.
RUN yarn build

# Start the api server
CMD [ "yarn", "start" ]
EXPOSE 3000
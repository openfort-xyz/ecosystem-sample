# Use an official Node runtime as the base image
FROM node:20.11-slim

WORKDIR /app

COPY . .

# Install production dependencies.
RUN yarn install

# Install production dependencies.
RUN yarn build

# Start the api server
CMD [ "yarn", "start" ]
EXPOSE 3000
# Use an official Node runtime as the base image
FROM node:20.11-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["yarn", "start"]
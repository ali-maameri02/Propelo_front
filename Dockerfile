# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY ./package.json ./yarn.lock ./
RUN npm install --force

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install -f

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build


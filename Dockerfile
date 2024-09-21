# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY package.json yarn.lock ./
RUN npm install

# Copy the rest of the source code and build the app
COPY . .

# Build the frontend application
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy build output to Nginx's html directory
COPY --from=build /app/dist /var/www/propelo/frontend

# Copy custom Nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

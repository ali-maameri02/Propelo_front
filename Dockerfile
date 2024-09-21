# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY ./package.json ./yarn.lock ./
RUN npm install --force

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Serve the app
FROM nginx:alpine

# Copy the Vite build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Keep Nginx running
CMD ["nginx", "-g", "daemon off;"]
CMD ["tail", "-f", "/dev/null"]

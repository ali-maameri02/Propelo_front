# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY ./package.json ./yarn.lock ./
RUN npm install --force

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build
# Use Nginx as the production server
FROM nginx:alpine

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/dist/comp-lib /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]

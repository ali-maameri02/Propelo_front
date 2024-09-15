# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install -f

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Use nginx to serve the built files
FROM nginx:alpine

# Copy the built files from the "build" stage (not "dist")
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port that nginx will serve on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

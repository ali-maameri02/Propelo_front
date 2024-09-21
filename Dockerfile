# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock for context
COPY package.json yarn.lock ./
RUN npm install --force  # Use npm to install dependencies

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build  # Build the application

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy built files from the build stage to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html  # Adjust if your output directory is different

# Copy custom Nginx configuration if needed
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]

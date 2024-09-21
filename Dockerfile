# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY package.json yarn.lock ./
RUN npm install -f

# Copy the rest of the source code and build the app
COPY . .

# Build the frontend application
RUN npm run build


FROM nginx:1.21.0-alpine

# Copy the ngnix.conf to the container
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the React app build files to the container
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
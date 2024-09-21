# Stage 1: Build the frontend app
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY ./package.json  package-lock.json ./ ./yarn.lock ./
RUN npm install --force

# Copy the rest of the source code and build the app
COPY . .


# Build the frontend application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port 80 for the application
EXPOSE 80

# Command to serve the build output
CMD ["serve", "-s", "build", "-l", "80"]
FROM node:lts-alpine as base

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install -f

COPY . .
CMD ["npm", "run", "build"]
# Use an nginx server to serve the frontend
FROM nginx:alpine

# Copy the built files to nginx's default serving directory
COPY --from=dist /app/dist /usr/share/nginx/html

# Expose the port that nginx is running on
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
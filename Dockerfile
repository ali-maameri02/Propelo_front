FROM node:lts-alpine as base

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install -f

COPY . .
CMD ["npm", "run", "build"]
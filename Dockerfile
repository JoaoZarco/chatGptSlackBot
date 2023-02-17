FROM node:18-alpine as base

WORKDIR /app
COPY package*.json /
RUN npm install

COPY . /app/
EXPOSE 4000

ENTRYPOINT [ "npm", "start" ]
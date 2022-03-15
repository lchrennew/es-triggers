FROM node:17.0-alpine3.13
COPY package.json build.sh start.sh ./
RUN sh build.sh

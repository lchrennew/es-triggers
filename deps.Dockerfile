FROM node:18-alpine
COPY package.json build.sh start.sh ./
RUN sh build.sh

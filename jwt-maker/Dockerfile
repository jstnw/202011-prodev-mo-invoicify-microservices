FROM node:15-alpine

WORKDIR /usr/src/jwt-maker

COPY ./src ./src
COPY ./package.json .

RUN ["npm", "install"]

CMD npm start

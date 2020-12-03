FROM node:15-alpine

WORKDIR /usr/src/gateway

COPY ./src ./src
COPY ./package.json .

RUN ["npm", "install"]

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN ["chmod", "+x", "/wait"]

CMD /wait && npm start

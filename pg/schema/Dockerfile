FROM node:15-alpine

WORKDIR /usr/src
COPY ./package.json .
COPY ./database.json .

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN ["chmod", "+x", "/wait"]

RUN ["npm", "install"]

CMD /wait && npm run migrate

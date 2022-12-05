FROM node:16

WORKDIR /home/robinmollah

COPY package*.json ./
COPY yarn.lock ./
RUN yarn
COPY . .


EXPOSE 3050
EXPOSE 8305
CMD [ "node", "server/bin.js" ]

FROM node:16

WORKDIR /home/robinmollah

COPY package*.json ./
COPY yarn.lock ./
RUN yarn
COPY . .


EXPOSE 3050
CMD [ "node", "server/bin.js" ]

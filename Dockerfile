FROM node:current-alpine3.16
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN echo "npm build!!!"
CMD ["node", "server.js"]

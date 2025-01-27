FROM node:18.20.5

WORKDIR /src

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
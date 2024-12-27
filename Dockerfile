FROM node:18.20.5

# WORKDIR /src

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run start
CMD ["node", "node src/server.js"]
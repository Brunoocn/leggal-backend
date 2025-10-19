FROM node:22-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

COPY . .

RUN chmod +x /app/wait-for-it.sh

RUN npm run build

RUN rm -rf node_modules

RUN npm install --legacy-peer-deps --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
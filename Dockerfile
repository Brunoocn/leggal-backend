FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm cache clean --force

RUN npm install --legacy-peer-deps

COPY .env.prod .env

COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

RUN npm run build

RUN rm -rf node_modules

RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN ls -la dist/

RUN yarn install --frozen-lockfile --production && yarn cache clean

RUN chmod +x /app/wait-for-it.sh

EXPOSE 3000

CMD ["node", "dist/main"]
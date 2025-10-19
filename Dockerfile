FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:22-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/wait-for-it.sh ./wait-for-it.sh

RUN chmod +x /app/wait-for-it.sh

EXPOSE 3000

CMD ["node", "dist/src/main"]
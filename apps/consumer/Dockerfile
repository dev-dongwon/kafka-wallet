FROM node:lts as development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN yarn install --frozen-lockfile

COPY apps/consumer apps/consumer
COPY common common

RUN yarn build consumer

FROM node:lts-slim as production

ENV NODE_ENV=production
USER node

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/apps/consumer/main.js" ]
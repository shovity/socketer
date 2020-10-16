FROM node:10.13-alpine

WORKDIR /app

COPY ["package.json", "yarn.lock*", "./"]
RUN yarn --pure-lockfile && mv node_modules ../

COPY . .

EXPOSE 2404
CMD yarn start
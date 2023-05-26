ARG NODE_IMAGE_VERSION=18-alpine3.17


FROM node:$NODE_IMAGE_VERSION as documentation
WORKDIR /src
COPY ./doc-generator/package*.json ./
RUN npm ci
COPY doc-generator/. /src/
COPY docs/ /docs
RUN npm run compile && node dist/index.js


FROM node:$NODE_IMAGE_VERSION as builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run compile


FROM node:$NODE_IMAGE_VERSION
COPY --from=documentation /docs/ docs/
COPY --from=builder package*.json ./

RUN npm ci --omit=dev && \
    adduser -u 2004 -D docker && \
    chown -R docker:docker /docs

COPY --from=builder /dist dist/

WORKDIR /src
CMD ["node", "/dist/src/index.js"]

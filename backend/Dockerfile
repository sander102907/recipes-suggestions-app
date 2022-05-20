# recipes subdomain backend
# build the backend first
FROM arm32v7/node:18-alpine as builder
# Create app directory
WORKDIR /backend

# Install app dependencies
COPY ./package*.json ./
RUN npm install

# Bundle app source
COPY ./ ./

RUN npm install -g tsoa
RUN npx prisma generate
RUN npm run build 

COPY ./src/swaggerDarkTheme.css ./build/src/swaggerDarkTheme.css

# production environment
FROM arm32v7/node:18-slim
WORKDIR /backend/build

COPY ./package*.json ./

RUN npm install --production

COPY --from=builder /backend/build .

RUN apt-get update
RUN apt-get -y install openssl wget

# prisma is not build for arm32, so download the binaries and setup a custom engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/query-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/libquery_engine.so
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/introspection-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/migration-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/prisma-fmt

RUN chmod +x query-engine
RUN chmod +x introspection-engine
RUN chmod +x migration-engine
RUN chmod +x prisma-fmt
RUN mv libquery_engine.so libquery_engine-linux-arm-openssl-1.1.x.so.node

ENV PRISMA_QUERY_ENGINE_BINARY /backend/query-engine
ENV PRISMA_QUERY_ENGINE_LIBRARY /backend/libquery_engine-linux-arm-openssl-1.1.x.so.node
ENV PRISMA_INTROSPECTION_ENGINE_BINARY /backend/introspection-engine
ENV PRISMA_MIGRATION_ENGINE_BINARY /backend/migration-engine
ENV PRISMA_FMT_BINARY /backend/prisma-fmt
ENV PRISMA_CLI_QUERY_ENGINE_TYPE binary
ENV PRISMA_QUERY_ENGINE_TYPE binary

# Install app dependencies
COPY ./package*.json ./
RUN npm install

# Bundle app source
COPY ./ ./

RUN npm install -g tsoa
RUN npx prisma generate
RUN npm run build 

COPY ./src/swaggerDarkTheme.css ./build/src/swaggerDarkTheme.css

# production environment
FROM arm32v7/node:18-slim
WORKDIR /backend/build

RUN apt-get update
RUN apt-get -y install openssl wget

# prisma is not build for arm32, so download the binaries and setup a custom engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/query-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/libquery_engine.so
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/introspection-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/migration-engine
RUN wget --quiet https://github.com/pantharshit00/prisma-rpi-builds/releases/download/3.2.1/prisma-fmt

RUN chmod +x query-engine
RUN chmod +x introspection-engine
RUN chmod +x migration-engine
RUN chmod +x prisma-fmt
RUN mv libquery_engine.so libquery_engine-linux-arm-openssl-1.1.x.so.node

ENV PRISMA_QUERY_ENGINE_BINARY /backend/query-engine
ENV PRISMA_QUERY_ENGINE_LIBRARY /backend/libquery_engine-linux-arm-openssl-1.1.x.so.node
ENV PRISMA_INTROSPECTION_ENGINE_BINARY /backend/introspection-engine
ENV PRISMA_MIGRATION_ENGINE_BINARY /backend/migration-engine
ENV PRISMA_FMT_BINARY /backend/prisma-fmt
ENV PRISMA_CLI_QUERY_ENGINE_TYPE binary
ENV PRISMA_QUERY_ENGINE_TYPE binary

COPY ./package*.json ./

RUN npm install --omit=dev

COPY --from=builder /backend/build .

RUN npm install prisma@3.2.1 -g

CMD ["npm", "run", "start:migrate"]
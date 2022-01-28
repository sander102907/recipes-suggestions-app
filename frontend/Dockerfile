# recipes subdomain frontend
FROM arm32v7/node:latest

# Create app directory
WORKDIR /usr/src/recipes_app/frontend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./
COPY ./.env ./

RUN npm ci
RUN export NODE_OPTIONS=--openssl-legacy-provider

# Bundle app source
COPY ./ ./

RUN npm run build

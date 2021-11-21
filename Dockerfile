# recipes subdomain
FROM arm32v7/node:latest

# put the ssl certificates in the container to allow for https
COPY ./ssl/certs/sdebruin.nl.pem /etc/ssl/certs/sdebruin.nl.pem
COPY ./ssl/private/sdebruin.nl.pem /etc/ssl/private/sdebruin.nl.pem

# Create app directory
WORKDIR /usr/src/recipes_app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src/ .

EXPOSE 8443
CMD [ "node", "server.js" ]

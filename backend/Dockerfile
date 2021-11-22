# recipes subdomain frontend
FROM arm32v7/node:latest

# Create app directory
WORKDIR /usr/src/recipes_app/frontend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN npm install

# Bundle app source
COPY ./ ./

RUN npm i
CMD ["npm", "run", "start"]

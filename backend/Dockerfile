# recipes subdomain frontend
FROM arm32v7/node:16-alpine
ENV NODE_ENV production
# Create app directory
WORKDIR /backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

RUN npm ci --only=prod

# Bundle app source
COPY ./ ./

RUN npm run build 

CMD ["npm", "run", "start"]
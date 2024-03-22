# recipes subdomain backend
# build the backend first
FROM node:18-slim
# Create app directory
WORKDIR /backend

RUN apt-get update
RUN apt-get -y install openssl

# Install app dependencies
COPY ./package*.json ./
RUN npm install

# Bundle app source
COPY ./ ./

RUN npm install -g tsoa
RUN npx prisma generate
RUN npm run build 

COPY ./src/swaggerDarkTheme.css ./build/src/swaggerDarkTheme.css

CMD ["npm", "run", "start:migrate"]

# recipes subdomain backend
# build the backend first
FROM node:18-alpine
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

CMD ["npm", "run", "start:migrate"]

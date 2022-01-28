# recipes subdomain frontend
FROM arm32v7/node:16-alpine as builder
ENV NODE_ENV production
# Create app directory
WORKDIR /backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

RUN npm ci

# Bundle app source
COPY ./ ./

CMD ["npm", "run", "start"]

# Bundle static assets with nginx
FROM nginx:1.21.6-alpine as production
ENV NODE_ENV production

# Add your nginx.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]

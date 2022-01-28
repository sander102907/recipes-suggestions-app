# recipes subdomain frontend
FROM arm32v7/node:16-alpine as builder
ENV NODE_ENV production
# Create app directory
WORKDIR /frontend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json ./
COPY ./.env ./

RUN yarn install --production --network-timeout=30000

# Bundle app source
COPY ./ ./

# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:1.21.6-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /frontend/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]


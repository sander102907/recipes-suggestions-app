# recipes subdomain frontend
FROM arm32v7/node:18 as builder
# Create app directory
WORKDIR /frontend

# Install app dependencies
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install --network-timeout=1000000

# Bundle app source
COPY ./ ./

# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:1.21.6-alpine as production
# Copy built assets from builder
COPY --from=builder /frontend/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 3000
# Start nginx
CMD ["nginx", "-g", "daemon off;"]

